use crate::db::db_executor::DBExecutor;
use crate::utils::storage::Storage;
use actix::SyncArbiter;
use actix_cors::Cors;
use actix_web::middleware::Logger;
use actix_web::{App as ActixApp, HttpServer};

use crate::app::{count::count, delete::delete, download::download, list::list, upload::upload};
use crate::db::connection::init_connection_pool;

pub struct App {}

impl App {
  pub async fn start(host: String) -> std::io::Result<()> {
    let pool =
      init_connection_pool(&std::env::var("MYSQL_URL").expect("MYSQL_URL is not specified."));
    let addr = SyncArbiter::start(3, move || DBExecutor::new(&pool));
    let storage =
      Storage::new(&std::env::var("STORAGE_PATH").expect("STORAGE_PATH is not specified"));
    HttpServer::new(move || {
      ActixApp::new()
        .wrap(Cors::new().max_age(3600).finish())
        .wrap(Logger::default())
        .data(addr.clone())
        .data(storage.clone())
        .service(list)
        .service(upload)
        .service(delete)
        .service(download)
        .service(count)
    })
    .bind(host)?
    .run()
    .await
  }
}
