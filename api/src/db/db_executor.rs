use crate::db::connection::{ConnectionPool, MysqlConnectionManager};
use crate::domain::model::{File, NewFile};
use crate::error::FileStorageError;

use std::string::String;
use std::vec::Vec;

use actix::prelude::*;
use chrono::offset::Local;
use diesel::prelude::*;
use r2d2::PooledConnection;

#[cfg(debug_assertions)]
use diesel_logger::LoggingConnection;

pub struct DBExecutor {
  pool: ConnectionPool,
}

type DBExecutorResult<T> = Result<T, FileStorageError>;

no_arg_sql_function!(
  last_insert_id,
  diesel::sql_types::Unsigned<diesel::sql_types::Bigint>
);

impl DBExecutor {
  pub fn new(pool: &ConnectionPool) -> DBExecutor {
    DBExecutor { pool: pool.clone() }
  }

  pub fn get_count(&self) -> DBExecutorResult<i64> {
    use crate::domain::schema::files;
    let conn = self.get_conn()?;
    let result = files::dsl::files
      .select(diesel::dsl::count_star())
      .first(&conn)?;
    Ok(result)
  }

  pub fn get_file(&self, id: u64) -> DBExecutorResult<File> {
    use crate::domain::schema::files;
    let conn = self.get_conn()?;
    let result = files::dsl::files.find(id).first(&conn)?;
    Ok(result)
  }

  pub fn get_file_list(&self, offset: i64, limit: i64) -> DBExecutorResult<Vec<File>> {
    use crate::domain::schema::files::dsl::*;
    let conn = self.get_conn()?;
    let of = if (offset - 1) < 0 { 0 } else { offset - 1 };
    let result = files
      .limit(limit)
      .order_by((created_at.desc(), id.desc()))
      .offset(of * limit)
      .load(&conn)?;
    Ok(result)
  }

  pub fn insert_file(&self, name: &str) -> DBExecutorResult<File> {
    use crate::domain::schema::files;
    let now = Local::now().naive_local();
    let new_file = NewFile {
      name,
      created_at: now,
    };
    let conn = self.get_conn()?;
    let result = conn.transaction(|| {
      diesel::insert_into(files::table)
        .values(&new_file)
        .execute(&conn)
    });
    match result {
      Ok(_) => {
        let id = diesel::select(last_insert_id).first(&conn)?;
        self.get_file(id)
      }
      Err(e) => Err(FileStorageError::from(e)),
    }
  }

  pub fn delete_file(&self, delete_id: u64) -> DBExecutorResult<File> {
    use crate::domain::schema::files::dsl::*;
    let conn = self.get_conn()?;
    let file_to_delete = self.get_file(delete_id)?;
    conn.transaction(|| diesel::delete(files.filter(id.eq(delete_id))).execute(&conn))?;
    Ok(file_to_delete)
  }

  #[cfg(debug_assertions)]
  fn get_conn(
    &self,
  ) -> Result<LoggingConnection<PooledConnection<MysqlConnectionManager>>, FileStorageError> {
    let c = self.pool.get()?;
    Ok(LoggingConnection::new(c))
  }

  #[cfg(not(debug_assertions))]
  fn get_conn(&self) -> Result<PooledConnection<MysqlConnectionManager>, FileStorageError> {
    return Ok(self.pool.get()?);
  }
}

impl Actor for DBExecutor {
  type Context = SyncContext<Self>;
}

pub struct GetSingleFile {
  pub id: u64,
}

impl Message for GetSingleFile {
  type Result = DBExecutorResult<File>;
}

impl Handler<GetSingleFile> for DBExecutor {
  type Result = DBExecutorResult<File>;

  fn handle(&mut self, msg: GetSingleFile, _: &mut Self::Context) -> Self::Result {
    self.get_file(msg.id)
  }
}

pub struct GetCount {}

impl Message for GetCount {
  type Result = DBExecutorResult<i64>;
}

impl Handler<GetCount> for DBExecutor {
  type Result = DBExecutorResult<i64>;

  fn handle(&mut self, _msg: GetCount, _: &mut Self::Context) -> Self::Result {
    self.get_count()
  }
}

pub struct GetFile {
  pub offset: i64,
  pub limit: i64,
}

impl Message for GetFile {
  type Result = DBExecutorResult<Vec<File>>;
}

impl Handler<GetFile> for DBExecutor {
  type Result = DBExecutorResult<Vec<File>>;

  fn handle(&mut self, msg: GetFile, _: &mut Self::Context) -> Self::Result {
    self.get_file_list(msg.offset, msg.limit)
  }
}

pub struct CreateFile {
  pub name: String,
}

impl Message for CreateFile {
  type Result = DBExecutorResult<File>;
}

impl Handler<CreateFile> for DBExecutor {
  type Result = DBExecutorResult<File>;

  fn handle(&mut self, msg: CreateFile, _: &mut Self::Context) -> Self::Result {
    self.insert_file(&msg.name)
  }
}

pub struct DeleteFile {
  pub id: u64,
}

impl Message for DeleteFile {
  type Result = DBExecutorResult<File>;
}

impl Handler<DeleteFile> for DBExecutor {
  type Result = DBExecutorResult<File>;

  fn handle(&mut self, msg: DeleteFile, _: &mut Self::Context) -> Self::Result {
    self.delete_file(msg.id)
  }
}
