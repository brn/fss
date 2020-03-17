use crate::app::{
  query_entity::ListQuery,
  responder::{err_json, ok_json},
};
use crate::config::MAX_LIST_COUNT;
use crate::db::db_executor::{DBExecutor, GetFile};
use actix::Addr;
use actix_web::{get, web, HttpResponse, Result};

#[get("/list")]
pub async fn list(
  query: web::Query<ListQuery>,
  db_executor: web::Data<Addr<DBExecutor>>,
) -> Result<HttpResponse> {
  Ok(
    db_executor
      .send(GetFile {
        offset: query.offset.unwrap_or(0),
        limit: query.limit.unwrap_or(MAX_LIST_COUNT),
      })
      .await
      .and_then(|res| match res {
        Ok(ref f) => Ok(ok_json(f)),
        Err(e) => Ok(err_json(e)),
      })
      .unwrap(),
  )
}
