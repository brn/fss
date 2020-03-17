use crate::error::FileStorageError;
use std::fs::{remove_file, File};
use std::io::{BufReader, BufWriter};
use std::io::{Read, Write};
use std::vec::Vec;

pub type StorageResult<T> = Result<T, FileStorageError>;

/// File entity maanger.
/// This struct has storage path of the file entity.
#[derive(Debug, Clone)]
pub struct Storage {
  path: String,
}

impl Storage {
  /// Create Storage instance.
  pub fn new(path: &str) -> Storage {
    Storage {
      path: path.to_string(),
    }
  }

  /// Write file to storage as format like /path/{id}.
  pub fn write(&self, file: &[u8], id: u64) -> StorageResult<String> {
    let path = self.create_path(id);
    let mut writer = BufWriter::new(File::create(&path)?);
    writer.write_all(file)?;
    Ok(path)
  }

  /// Read file from storage.
  pub fn read(&self, id: u64) -> StorageResult<Vec<u8>> {
    let mut reader = BufReader::new(File::open(self.create_path(id))?);
    let mut buf: Vec<u8> = Vec::new();
    reader.read_to_end(&mut buf)?;
    Ok(buf)
  }

  /// Delete file.
  pub fn delete(&self, id: u64) -> StorageResult<()> {
    Ok(remove_file(self.create_path(id))?)
  }

  /// Concatenate path and id.
  fn create_path(&self, id: u64) -> String {
    format!("{}/{}", self.path, id)
  }
}

#[test]
fn unit_test_write_to_storage_success() {
  let file = "test".as_bytes();
  let storage = Storage::new("/tmp");
  assert_eq!(storage.write(&file, 1).is_ok(), true);
  let result = storage.read(1);
  assert_eq!(result.is_ok(), true);
  let file = result.unwrap();
  assert_eq!(String::from_utf8(file).unwrap(), "test");
  let delete_result = storage.delete(1);
  assert_eq!(delete_result.is_ok(), true);
}

#[test]
fn unit_test_write_to_storage_invalid_path_failed() {
  let file = "test".as_bytes();
  let storage = Storage::new("");
  assert_eq!(storage.write(&file, 1).is_err(), true);
  let result = storage.read(1);
  assert_eq!(result.is_err(), true);
  let delete_result = storage.delete(1);
  assert_eq!(delete_result.is_err(), true);
}
