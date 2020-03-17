use crate::app::responder::{err_json, ok_json};
use crate::db::db_executor::{DBExecutor, DeleteFile};
use crate::error::FileStorageError;
use crate::utils::storage::Storage;
use actix::Addr;
use actix_web::{delete, web, HttpResponse, Result};

#[delete("/file/{id}")]
pub async fn delete(
  id_path: web::Path<u64>,
  db_executor: web::Data<Addr<DBExecutor>>,
  storage: web::Data<Storage>,
) -> Result<HttpResponse> {
  let id = id_path.into_inner();
  Ok(
    db_executor
      .send(DeleteFile { id })
      .await
      .map(|res| match res {
        Ok(f) => match storage.delete(id) {
          Ok(_) => ok_json(f),
          Err(e) => err_json(e),
        },
        Err(e) => err_json(FileStorageError::from(e)),
      })
      .map_err(|e| err_json(FileStorageError::from(e)))
      .unwrap(),
  )
}
