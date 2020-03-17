use actix_multipart::Multipart;
use futures::StreamExt;
use std::io::Write;
use std::path::Path as StdPath;
use std::vec::Vec;

use crate::config::MAX_FILE_SIZE;
use crate::error::FileStorageError;

/// Parsed form-data represented struct.
#[derive(Debug, Clone)]
pub struct FormData {
  pub filename: String,
  pub data: Vec<u8>,
}

impl FormData {
  ///
  /// Parse multipart/form-data content.
  /// If parse failed, return FileStorageError, otherwise FormData.
  ///
  pub async fn parse_multipart(mut payload: Multipart) -> Result<FormData, FileStorageError> {
    // iterate over multipart stream
    while let Some(item) = payload.next().await {
      let mut field = item?;
      let content_type = field
        .content_disposition()
        .ok_or_else(|| FileStorageError::empty_multipart())?;
      return match StdPath::new(
        content_type
          .get_filename()
          .ok_or_else(|| FileStorageError::empty_multipart())?,
      )
      .file_name()
      {
        Some(filename) => {
          let mut buffer = Vec::new();
          while let Some(chunk) = field.next().await {
            let data = chunk.unwrap();
            buffer.write(&data)?;

            if (buffer.len() as u64) > MAX_FILE_SIZE {
              return Err(FileStorageError::file_size_exceeded());
            }
          }

          return match filename.to_str() {
            Some(filename) => Ok(FormData {
              data: buffer,
              filename: filename.to_string(),
            }),
            None => Err(FileStorageError::empty_multipart()),
          };
        }
        None => Err(FileStorageError::empty_multipart()),
      };
    }

    Err(FileStorageError::empty_multipart())
  }
}

#[cfg(test)]
use actix_utils::mpsc;
#[cfg(test)]
use actix_web::error::PayloadError;
#[cfg(test)]
use actix_web::http::header::{self, HeaderMap};
#[cfg(test)]
use bytes::Bytes;
#[cfg(test)]
use futures::stream::Stream;

/// Code from actix_multipart for testing.
/// Create stream.
#[cfg(test)]
fn create_stream() -> (
  mpsc::Sender<Result<Bytes, PayloadError>>,
  impl Stream<Item = Result<Bytes, PayloadError>>,
) {
  let (tx, rx) = mpsc::channel();

  (tx, rx.map(|res| res.map_err(|_| panic!())))
}

/// Code from actix_multipart for testing.
/// Create multipart/form-data request headers and body.
#[cfg(test)]
fn create_simple_request_with_header(content: &'static str) -> (Bytes, HeaderMap) {
  let bytes = Bytes::from(content);
  let mut headers = HeaderMap::new();
  headers.insert(
    header::CONTENT_TYPE,
    header::HeaderValue::from_static(
      "multipart/mixed; boundary=\"abbc761f78ff4d7cb7573b5a23f96ef0\"",
    ),
  );
  (bytes, headers)
}

#[actix_rt::test]
async fn unit_test_multipart_parser_will_success() {
  let (sender, payload) = create_stream();
  let (bytes, headers) = create_simple_request_with_header(
    "testasdadsad\r\n\
     --abbc761f78ff4d7cb7573b5a23f96ef0\r\n\
     Content-Disposition: form-data; name=\"file\"; filename=\"fn.txt\"\r\n\
     Content-Type: text/plain; charset=utf-8\r\nContent-Length: 4\r\n\r\n\
     test\r\n\
     --abbc761f78ff4d7cb7573b5a23f96ef0\r\n\
     Content-Type: text/plain; charset=utf-8\r\nContent-Length: 4\r\n\r\n\
     data\r\n\
     --abbc761f78ff4d7cb7573b5a23f96ef0--\r\n",
  );
  sender.send(Ok(bytes)).unwrap();

  let result = FormData::parse_multipart(Multipart::new(&headers, payload)).await;
  assert_eq!(result.is_ok(), true);
  let form_data = result.unwrap();
  assert_eq!(form_data.filename, "fn.txt");
  let content = String::from_utf8(form_data.data).unwrap();
  assert_eq!(content, "test");
}

#[actix_rt::test]
async fn unit_test_multipart_parser_without_filename_will_fail() {
  let (sender, payload) = create_stream();
  let (bytes, headers) = create_simple_request_with_header(
    "testasdadsad\r\n\
     --abbc761f78ff4d7cb7573b5a23f96ef0\r\n\
     Content-Disposition: form-data; name=\"file\";\r\n\
     Content-Type: text/plain; charset=utf-8\r\nContent-Length: 4\r\n\r\n\
     test\r\n\
     --abbc761f78ff4d7cb7573b5a23f96ef0\r\n\
     Content-Type: text/plain; charset=utf-8\r\nContent-Length: 4\r\n\r\n\
     data\r\n\
     --abbc761f78ff4d7cb7573b5a23f96ef0--\r\n",
  );
  sender.send(Ok(bytes)).unwrap();

  let result = FormData::parse_multipart(Multipart::new(&headers, payload)).await;
  assert_eq!(result.is_err(), true);
  let err = result.err().unwrap();
  assert_eq!(
    format!("{}", err),
    format!("{}", FileStorageError::empty_multipart())
  );
}

#[actix_rt::test]
async fn unit_test_multipart_parser_without_disposition_will_fail() {
  let (sender, payload) = create_stream();
  let (bytes, headers) = create_simple_request_with_header(
    "testasdadsad\r\n\
     --abbc761f78ff4d7cb7573b5a23f96ef0\r\n\
     Content-Type: text/plain; charset=utf-8\r\nContent-Length: 4\r\n\r\n\
     test\r\n\
     --abbc761f78ff4d7cb7573b5a23f96ef0\r\n\
     Content-Type: text/plain; charset=utf-8\r\nContent-Length: 4\r\n\r\n\
     data\r\n\
     --abbc761f78ff4d7cb7573b5a23f96ef0--\r\n",
  );
  sender.send(Ok(bytes)).unwrap();

  let result = FormData::parse_multipart(Multipart::new(&headers, payload)).await;
  assert_eq!(result.is_err(), true);
  let err = result.err().unwrap();
  assert_eq!(
    format!("{}", err),
    format!("{}", FileStorageError::empty_multipart())
  );
}

#[actix_rt::test]
async fn unit_test_multipart_parser_without_content_will_fail() {
  let (sender, payload) = create_stream();
  let (bytes, headers) = create_simple_request_with_header(
    "testasdadsad\r\n\
     --abbc761f78ff4d7cb7573b5a23f96ef0\r\n\
     Content-Type: text/plain; charset=utf-8\r\nContent-Length: 4\r\n\r\n\
     --abbc761f78ff4d7cb7573b5a23f96ef0\r\n\
     Content-Type: text/plain; charset=utf-8\r\nContent-Length: 4\r\n\r\n\
     --abbc761f78ff4d7cb7573b5a23f96ef0--\r\n",
  );
  sender.send(Ok(bytes)).unwrap();

  let result = FormData::parse_multipart(Multipart::new(&headers, payload)).await;
  assert_eq!(result.is_err(), true);
  let err = result.err().unwrap();
  assert_eq!(
    format!("{}", err),
    format!("{}", FileStorageError::empty_multipart())
  );
}
