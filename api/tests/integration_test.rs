extern crate file_storage_server;
use actix::SyncArbiter;
use actix_web::{test, App};
use bytes::Bytes;
use diesel::connection::Connection;
use file_storage_server::{
  app::{delete::delete, download::download, list::list, upload::upload},
  db::connection::init_connection_pool,
  db::db_executor::DBExecutor,
  domain::model::File,
  utils::storage::Storage,
};
use std::process::Command;
use std::vec::Vec;

fn setup<Conn>(conn: &Conn)
where
  Conn: Connection,
{
  match conn.transaction(|| {
    conn.batch_execute(
      r"
INSERT INTO files (name, created_at) VALUES ('test_data_1', '2020-01-01 00:00:00');
INSERT INTO files (name, created_at) VALUES ('test_data_2', '2020-01-01 00:00:01');
INSERT INTO files (name, created_at) VALUES ('test_data_3', '2020-01-01 00:00:02');
INSERT INTO files (name, created_at) VALUES ('test_data_4', '2020-01-01 00:00:03');
INSERT INTO files (name, created_at) VALUES ('test_data_5', '2020-01-01 00:00:04');",
    )
  }) {
    Ok(_) => {}
    Err(e) => panic!("{}", e),
  };
}

fn get_sql_result(db: &str) -> String {
  let result = Command::new("sh")
    .arg("-c")
    .arg(format!(
      "mysql -uroot -proot -h127.0.0.1  {}  -N -B -e 'select id, name from files order by id asc'",
      db
    ))
    .output()
    .expect("failed to execute process");

  String::from_utf8(result.stdout).unwrap()
}

#[actix_rt::test]
async fn integration_test_list_without_limit() {
  let pool = init_connection_pool("mysql://root:root@127.0.0.1:3306/db1");
  setup(&pool.get().unwrap());
  let pool_clone = pool.clone();
  let addr = SyncArbiter::start(3, move || DBExecutor::new(&pool_clone));
  let storage = Storage::new("./.test/db1");

  let mut app =
    test::init_service(App::new().data(pool).data(addr).data(storage).service(list)).await;
  let req = test::TestRequest::get().uri("/list").to_request();
  let resp: Vec<File> = test::read_response_json(&mut app, req).await;
  assert_eq!(resp.len(), 5);
  assert_eq!(resp[0].name, "test_data_5");
  assert_eq!(resp[0].id, 5);
  assert_eq!(resp[1].name, "test_data_4");
  assert_eq!(resp[1].id, 4);
  assert_eq!(resp[2].name, "test_data_3");
  assert_eq!(resp[2].id, 3);
  assert_eq!(resp[3].name, "test_data_2");
  assert_eq!(resp[3].id, 2);
  assert_eq!(resp[4].name, "test_data_1");
  assert_eq!(resp[4].id, 1);
}

#[actix_rt::test]
async fn integration_test_list_with_limit() {
  let pool = init_connection_pool("mysql://root:root@127.0.0.1:3306/db2");
  setup(&pool.get().unwrap());
  let pool_clone = pool.clone();
  let addr = SyncArbiter::start(3, move || DBExecutor::new(&pool_clone));
  let storage = Storage::new("./.test/db2");

  let mut app =
    test::init_service(App::new().data(pool).data(addr).data(storage).service(list)).await;
  {
    let req = test::TestRequest::get().uri("/list?limit=2").to_request();
    let resp: Vec<File> = test::read_response_json(&mut app, req).await;
    assert_eq!(resp.len(), 2);
    assert_eq!(resp[0].name, "test_data_5");
    assert_eq!(resp[0].id, 5);
    assert_eq!(resp[1].name, "test_data_4");
    assert_eq!(resp[1].id, 4);
  }

  {
    let req = test::TestRequest::get()
      .uri("/list?limit=2&offset=2")
      .to_request();
    let resp: Vec<File> = test::read_response_json(&mut app, req).await;
    assert_eq!(resp.len(), 2);
    assert_eq!(resp[0].name, "test_data_3");
    assert_eq!(resp[0].id, 3);
    assert_eq!(resp[1].name, "test_data_2");
    assert_eq!(resp[1].id, 2);
  }

  {
    let req = test::TestRequest::get()
      .uri("/list?limit=2&offset=3")
      .to_request();
    let resp: Vec<File> = test::read_response_json(&mut app, req).await;
    assert_eq!(resp.len(), 1);
    assert_eq!(resp[0].name, "test_data_1");
    assert_eq!(resp[0].id, 1);
  }
}

#[actix_rt::test]
async fn integration_test_download() {
  let pool = init_connection_pool("mysql://root:root@127.0.0.1:3306/db3");
  setup(&pool.get().unwrap());
  let pool_clone = pool.clone();
  let addr = SyncArbiter::start(3, move || DBExecutor::new(&pool_clone));
  let storage = Storage::new("./.test/db3");

  let mut app = test::init_service(
    App::new()
      .data(pool)
      .data(addr)
      .data(storage)
      .service(download),
  )
  .await;
  {
    let req = test::TestRequest::get().uri("/file/1").to_request();
    let resp = test::read_response(&mut app, req).await;
    assert_eq!(resp, Bytes::from_static(b"test1\n"));
  }

  {
    let req = test::TestRequest::get().uri("/file/2").to_request();
    let resp = test::read_response(&mut app, req).await;
    assert_eq!(resp, Bytes::from_static(b"test2\n"));
  }

  {
    let req = test::TestRequest::get().uri("/file/3").to_request();
    let resp = test::read_response(&mut app, req).await;
    assert_eq!(resp, Bytes::from_static(b"test3\n"));
  }

  {
    let req = test::TestRequest::get().uri("/file/4").to_request();
    let resp = test::read_response(&mut app, req).await;
    assert_eq!(resp, Bytes::from_static(b"test4\n"));
  }

  {
    let req = test::TestRequest::get().uri("/file/5").to_request();
    let resp = test::read_response(&mut app, req).await;
    assert_eq!(resp, Bytes::from_static(b"test5\n"));
  }

  {
    let req = test::TestRequest::get().uri("/file/1000").to_request();
    let resp = test::call_service(&mut app, req).await;
    assert!(!resp.status().is_success());
  }
}

#[actix_rt::test]
async fn integration_test_upload() {
  let pool = init_connection_pool("mysql://root:root@127.0.0.1:3306/db4");
  setup(&pool.get().unwrap());
  let pool_clone = pool.clone();
  let addr = SyncArbiter::start(3, move || DBExecutor::new(&pool_clone));
  let storage = Storage::new("./.test/db4");

  let mut app = test::init_service(
    App::new()
      .data(pool)
      .data(addr)
      .data(storage)
      .service(upload),
  )
  .await;
  {
    let req = test::TestRequest::post()
      .set_payload(Bytes::from(
        "testasdadsad\r\n\
     --abbc761f78ff4d7cb7573b5a23f96ef0\r\n\
     Content-Disposition: form-data; name=\"file\"; filename=\"fn.txt\"\r\n\
     Content-Type: text/plain; charset=utf-8\r\nContent-Length: 4\r\n\r\n\
     test\r\n\
     --abbc761f78ff4d7cb7573b5a23f96ef0\r\n\
     Content-Type: text/plain; charset=utf-8\r\nContent-Length: 4\r\n\r\n\
     data\r\n\
     --abbc761f78ff4d7cb7573b5a23f96ef0--\r\n",
      ))
      .header(
        "Content-Type",
        "multipart/mixed; boundary=\"abbc761f78ff4d7cb7573b5a23f96ef0\"",
      )
      .uri("/upload")
      .to_request();
    let resp: File = test::read_response_json(&mut app, req).await;
    assert_eq!(resp.name, "fn.txt");
    assert_eq!(
      "1\ttest_data_1
2\ttest_data_2
3\ttest_data_3
4\ttest_data_4
5\ttest_data_5
6\tfn.txt\n",
      get_sql_result("db4")
    );
  }
}

#[actix_rt::test]
async fn integration_test_upload_failed() {
  let pool = init_connection_pool("mysql://root:root@127.0.0.1:3306/db5");
  setup(&pool.get().unwrap());
  let pool_clone = pool.clone();
  let addr = SyncArbiter::start(3, move || DBExecutor::new(&pool_clone));
  let storage = Storage::new("./.test/db5");

  let mut app = test::init_service(
    App::new()
      .data(pool)
      .data(addr)
      .data(storage)
      .service(upload),
  )
  .await;
  {
    let req = test::TestRequest::post()
      .set_payload(Bytes::from(
        "testasdadsad\r\n\
     --abbc761f78ff4d7cb7573b5a23f96ef0\r\n\
     Content-Disposition: form-data; name=\"file\"; \r\n\
     Content-Type: text/plain; charset=utf-8\r\nContent-Length: 4\r\n\r\n\
     test\r\n\
     --abbc761f78ff4d7cb7573b5a23f96ef0\r\n\
     Content-Type: text/plain; charset=utf-8\r\nContent-Length: 4\r\n\r\n\
     data\r\n\
     --abbc761f78ff4d7cb7573b5a23f96ef0--\r\n",
      ))
      .header(
        "Content-Type",
        "multipart/mixed; boundary=\"abbc761f78ff4d7cb7573b5a23f96ef0\"",
      )
      .uri("/upload")
      .to_request();
    let resp = test::call_service(&mut app, req).await;
    assert!(!resp.status().is_success());
    assert_eq!(
      "1\ttest_data_1
2\ttest_data_2
3\ttest_data_3
4\ttest_data_4
5\ttest_data_5\n",
      get_sql_result("db5")
    );
  }
}

#[actix_rt::test]
async fn integration_test_upload_creation_failed_rollback() {
  let pool = init_connection_pool("mysql://root:root@127.0.0.1:3306/db7");
  setup(&pool.get().unwrap());
  let pool_clone = pool.clone();
  let addr = SyncArbiter::start(3, move || DBExecutor::new(&pool_clone));
  let storage = Storage::new("/NO_PERMISSION");

  let mut app = test::init_service(
    App::new()
      .data(pool)
      .data(addr)
      .data(storage)
      .service(upload),
  )
  .await;
  {
    let req = test::TestRequest::post()
      .set_payload(Bytes::from(
        "testasdadsad\r\n\
     --abbc761f78ff4d7cb7573b5a23f96ef0\r\n\
     Content-Disposition: form-data; name=\"file\"; filename=\"fn.txt\"\r\n\
     Content-Type: text/plain; charset=utf-8\r\nContent-Length: 4\r\n\r\n\
     test\r\n\
     --abbc761f78ff4d7cb7573b5a23f96ef0\r\n\
     Content-Type: text/plain; charset=utf-8\r\nContent-Length: 4\r\n\r\n\
     data\r\n\
     --abbc761f78ff4d7cb7573b5a23f96ef0--\r\n",
      ))
      .header(
        "Content-Type",
        "multipart/mixed; boundary=\"abbc761f78ff4d7cb7573b5a23f96ef0\"",
      )
      .uri("/upload")
      .to_request();
    let resp = test::call_service(&mut app, req).await;
    assert!(!resp.status().is_success());
    assert_eq!(
      "1\ttest_data_1
2\ttest_data_2
3\ttest_data_3
4\ttest_data_4
5\ttest_data_5\n",
      get_sql_result("db7")
    );
  }
}

#[actix_rt::test]
async fn integration_test_delete() {
  let pool = init_connection_pool("mysql://root:root@127.0.0.1:3306/db6");
  setup(&pool.get().unwrap());
  let pool_clone = pool.clone();
  let addr = SyncArbiter::start(3, move || DBExecutor::new(&pool_clone));
  let storage = Storage::new("./.test/db6");

  let mut app = test::init_service(
    App::new()
      .data(pool)
      .data(addr)
      .data(storage)
      .service(delete),
  )
  .await;

  {
    let req = test::TestRequest::delete().uri("/file/1").to_request();
    let resp: File = test::read_response_json(&mut app, req).await;
    assert_eq!(resp.id, 1);
  }

  {
    let req = test::TestRequest::delete().uri("/file/2").to_request();
    let resp: File = test::read_response_json(&mut app, req).await;
    assert_eq!(resp.id, 2);
  }

  {
    let req = test::TestRequest::delete().uri("/file/3").to_request();
    let resp: File = test::read_response_json(&mut app, req).await;
    assert_eq!(resp.id, 3);
  }

  {
    let req = test::TestRequest::delete().uri("/file/4").to_request();
    let resp: File = test::read_response_json(&mut app, req).await;
    assert_eq!(resp.id, 4);
  }

  {
    let req = test::TestRequest::delete().uri("/file/5").to_request();
    let resp: File = test::read_response_json(&mut app, req).await;
    assert_eq!(resp.id, 5);
  }

  {
    let req = test::TestRequest::delete().uri("/file/10000").to_request();
    let resp = test::call_service(&mut app, req).await;
    assert!(!resp.status().is_success());
  }

  assert_eq!("", get_sql_result("db6"));
}
