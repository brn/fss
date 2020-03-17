//! # Error definitions for application.
//!
//! All errors occured in runtime will defined in this file.
//! FileStorageError derive failure::Fail and serde, so you can simply serialize with serde_json.
//!
use crate::config::MAX_FILE_SIZE;
use actix::MailboxError;
use actix_multipart::MultipartError;
use actix_web::error::BlockingError;
use diesel::result::Error as DieselError;
use failure::{Backtrace, Context, Fail};
use serde::{Serialize, Serializer};
use std::convert::From;
use std::fmt;
use std::io::Error as IOError;

/// Serialize failure::Context
///
/// # Example
///
/// struct Error {
///   #[serde(serialize_with = "serialize_error")]
///   inner: Context<ErrorKind>
/// }
fn serialize_error<S>(value: &Context<ErrorKind>, serializer: S) -> Result<S::Ok, S::Error>
where
  S: Serializer,
{
  // Round error messages for hide internal information from user.
  match value.get_context() {
    ErrorKind::InvalidMultipart(_) => {
      serializer.serialize_str("File is corrupted or can't accept in this service")
    }
    _ => serializer
      .serialize_str("This service faced with some problems, please wait a minutes and try again"),
  }
}

#[derive(Fail, Debug)]
pub enum ErrorKind {
  #[fail(display = "File must be specified in form-data/multipart request.")]
  EmptyMultipart,

  #[fail(display = "File size must be less than {} GB", _0)]
  FileSizeExceeded(u32),

  #[fail(
    display = "File {} already exists, please delete file before upload",
    _0
  )]
  FileAlreadyExists(String),

  #[fail(display = "File name {} is invalid", _0)]
  InvalidFilename(String),

  #[fail(display = "{}", _0)]
  InvalidMultipart(MultipartError),

  #[fail(display = "{}", _0)]
  IOError(String),

  #[fail(display = "{}", _0)]
  DBExecutorError(String),

  #[fail(display = "{}", _0)]
  Blocking(String),

  #[fail(display = "{}", _0)]
  Actor(String),
}

#[derive(Debug, Serialize)]
#[serde(tag = "error")]
pub struct FileStorageError {
  #[serde(rename = "description", serialize_with = "serialize_error")]
  inner: Context<ErrorKind>,
}

impl Fail for FileStorageError {
  fn cause(&self) -> Option<&dyn Fail> {
    self.inner.cause()
  }

  fn backtrace(&self) -> Option<&Backtrace> {
    self.inner.backtrace()
  }
}

impl fmt::Display for FileStorageError {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    fmt::Display::fmt(&self.inner, f)
  }
}

impl FileStorageError {
  pub fn new(inner: Context<ErrorKind>) -> FileStorageError {
    FileStorageError { inner }
  }

  pub fn kind(&self) -> &ErrorKind {
    self.inner.get_context()
  }

  pub fn empty_multipart() -> FileStorageError {
    FileStorageError::new(Context::new(ErrorKind::EmptyMultipart))
  }

  pub fn file_size_exceeded() -> FileStorageError {
    FileStorageError::new(Context::new(ErrorKind::FileSizeExceeded(
      (MAX_FILE_SIZE / 1024 / 1024) as u32,
    )))
  }

  pub fn invalid_filename(name: &str) -> FileStorageError {
    FileStorageError::new(Context::new(ErrorKind::InvalidFilename(name.to_string())))
  }

  pub fn file_already_exists(name: &str) -> FileStorageError {
    FileStorageError::new(Context::new(ErrorKind::FileAlreadyExists(name.to_string())))
  }

  pub fn to_string(&self) -> &'static str {
    match self.inner.get_context() {
      ErrorKind::InvalidMultipart(_) => "File is corrupted or can't accept in this service",
      _ => "This service faced with some problems, please wait a minutes and try again",
    }
  }
}

impl From<ErrorKind> for FileStorageError {
  fn from(kind: ErrorKind) -> FileStorageError {
    FileStorageError {
      inner: Context::new(kind),
    }
  }
}

impl From<Context<ErrorKind>> for FileStorageError {
  fn from(inner: Context<ErrorKind>) -> FileStorageError {
    FileStorageError { inner }
  }
}

impl From<MultipartError> for FileStorageError {
  fn from(e: MultipartError) -> Self {
    FileStorageError {
      inner: Context::new(ErrorKind::InvalidMultipart(e)),
    }
  }
}

impl From<IOError> for FileStorageError {
  fn from(e: IOError) -> Self {
    let desc = format!("{}", e);
    FileStorageError {
      inner: e.context(ErrorKind::IOError(desc)),
    }
  }
}

impl From<DieselError> for FileStorageError {
  fn from(e: DieselError) -> Self {
    let desc = format!("{}", e);
    FileStorageError {
      inner: e.context(ErrorKind::DBExecutorError(desc)),
    }
  }
}

impl From<r2d2::Error> for FileStorageError {
  fn from(e: r2d2::Error) -> Self {
    let desc = format!("{}", e);
    FileStorageError {
      inner: e.context(ErrorKind::DBExecutorError(desc)),
    }
  }
}

impl<E: fmt::Debug> From<BlockingError<E>> for FileStorageError {
  fn from(e: BlockingError<E>) -> Self {
    let desc = format!("{}", e);
    FileStorageError {
      inner: Context::new(ErrorKind::Blocking(desc)),
    }
  }
}

impl From<MailboxError> for FileStorageError {
  fn from(e: MailboxError) -> Self {
    let desc = format!("{}", e);
    FileStorageError {
      inner: Context::new(ErrorKind::Actor(desc)),
    }
  }
}
