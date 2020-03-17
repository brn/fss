use crate::app::responder::{err_str, ok_file};
use crate::db::db_executor::{DBExecutor, GetSingleFile};
use crate::error::FileStorageError;
use crate::utils::storage::Storage;
use actix::Addr;
use actix_web::{get, web, HttpResponse, Result};

#[get("/file/{id}")]
pub async fn download(
  id: web::Path<u64>,
  db_executor: web::Data<Addr<DBExecutor>>,
  storage: web::Data<Storage>,
) -> Result<HttpResponse> {
  let found = db_executor
    .send(GetSingleFile {
      id: id.into_inner(),
    })
    .await;

  match found {
    Ok(ret) => match ret {
      Ok(ref file) => Ok(
        storage
          .read(file.id)
          .map(|f| ok_file(f, &file.name))
          .unwrap_or_else(|e| err_str(FileStorageError::from(e))),
      ),
      Err(e) => Ok(err_str(e)),
    },
    Err(e) => Ok(err_str(FileStorageError::from(e).to_string())),
  }
}
