use dotenv::dotenv;
use file_storage_server::app::app::App;

#[actix_rt::main]
async fn main() -> std::io::Result<()> {
  dotenv().ok();
  env_logger::init();

  App::start(format!(
    "{}",
    std::env::var("APP_URL").unwrap_or("127.0.0.1:8888".to_string())
  ))
  .await
}
