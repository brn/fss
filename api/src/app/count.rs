use crate::app::responder::{err_json, ok_json};
use crate::db::db_executor::{DBExecutor, GetCount};
use crate::error::FileStorageError;
use actix::Addr;
use actix_web::{get, web, HttpResponse, Result};
use serde_json::json;

#[get("/count")]
pub async fn count(db_executor: web::Data<Addr<DBExecutor>>) -> Result<HttpResponse> {
  Ok(
    db_executor
      .send(GetCount {})
      .await
      .map(|actor_result| match actor_result {
        Ok(count) => ok_json(json!({ "count": count })),
        Err(actor_error) => err_json(FileStorageError::from(actor_error)),
      })
      .unwrap_or_else(|e| err_json(FileStorageError::from(e))),
  )
}
