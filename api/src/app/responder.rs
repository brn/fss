use actix_web::HttpResponse;
use log::error;
use serde::ser::Serialize;
use std::fmt::{Debug, Display};
use std::vec::Vec;

pub fn ok_json<T>(json_convertible_response: T) -> HttpResponse
where
  T: Serialize,
{
  HttpResponse::Ok().json(json_convertible_response)
}

pub fn ok_file(response: Vec<u8>, filename: &str) -> HttpResponse {
  HttpResponse::Ok()
    .header("Content-Type", "application/octet-stream")
    .header("Content-Length", response.len())
    .header(
      "Content-Disposition",
      format!("attachment;filename=\"{}\"", filename),
    )
    .body(response)
}

pub fn err_json<E>(json_convertible_response: E) -> HttpResponse
where
  E: Serialize + Debug,
{
  error!("{:?}", json_convertible_response);
  HttpResponse::InternalServerError().json(json_convertible_response)
}

pub fn err_str<E>(body_convertible_response: E) -> HttpResponse
where
  E: Debug + Display,
{
  error!("{:?}", body_convertible_response);
  HttpResponse::InternalServerError().body(format!("{}", body_convertible_response))
}
