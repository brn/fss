use crate::domain::schema::files;
use ::typescript_definitions::TypeScriptify;
use chrono::naive::NaiveDateTime;
use serde::{Deserialize, Serialize};
use std::string::String;

#[derive(Queryable, Serialize, Deserialize, Clone, TypeScriptify)]
pub struct File {
  pub id: u64,
  pub name: String,
  pub created_at: NaiveDateTime,
}

#[derive(Insertable)]
#[table_name = "files"]
pub struct NewFile<'a> {
  pub name: &'a str,
  pub created_at: NaiveDateTime,
}
