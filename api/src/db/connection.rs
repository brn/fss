use diesel::mysql::MysqlConnection;
use diesel::r2d2::ConnectionManager;
use r2d2::Pool;
use std::time::Duration;

pub type MysqlConnectionManager = ConnectionManager<MysqlConnection>;
pub type ConnectionPool = Pool<MysqlConnectionManager>;

pub fn init_connection_pool(database_url: &str) -> ConnectionPool {
  let manager = ConnectionManager::<MysqlConnection>::new(database_url);
  Pool::builder()
    .connection_timeout(Duration::new(5, 0))
    .build(manager)
    .expect(&format!("Error connecting to {}", database_url))
}
