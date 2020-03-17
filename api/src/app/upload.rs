use crate::app::responder::{err_json, ok_json};
use crate::db::db_executor::{CreateFile, DBExecutor, DeleteFile};
use crate::error::FileStorageError;
use crate::utils::{multipart::FormData, storage::Storage};
use actix::Addr;
use actix_multipart::Multipart;
use actix_web::{post, web, HttpResponse, Result};
use log::error;

#[post("/upload")]
pub async fn upload(
  payload: Multipart,
  db_executor: web::Data<Addr<DBExecutor>>,
  storage: web::Data<Storage>,
) -> Result<HttpResponse> {
  let form_data_result = FormData::parse_multipart(payload).await;

  match form_data_result {
    Err(e) => {
      error!("{}", e);
      Ok(HttpResponse::InternalServerError().json(e))
    }
    Ok(form_data) => {
      let actor_result = db_executor
        .send(CreateFile {
          name: form_data.filename.clone(),
        })
        .await;

      match actor_result {
        Ok(db_execution_result) => {
          match db_execution_result {
            Ok(inserted_file) => {
              let st = storage.clone();
              let id = inserted_file.id;
              Ok(
                match web::block(move || st.write(&form_data.data, id)).await {
                  Ok(_) => ok_json(inserted_file),
                  Err(blocking_error) => {
                    // Do nothing if error found.
                    match db_executor.send(DeleteFile { id: id }).await {
                      Err(file_deletion_error) => {
                        error!("{}", file_deletion_error);
                      }
                      _ => {}
                    };
                    err_json(FileStorageError::from(blocking_error))
                  }
                },
              )
            }
            Err(db_execution_error) => Ok(err_json(FileStorageError::from(db_execution_error))),
          }
        }
        Err(actor_error) => Ok(err_json(FileStorageError::from(actor_error))),
      }
    }
  }
}
