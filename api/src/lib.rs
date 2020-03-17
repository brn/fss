#[macro_use]
extern crate diesel;
#[cfg(debug_assertions)]
extern crate diesel_logger;
extern crate dotenv;

#[macro_use]
extern crate failure;

pub mod app;
pub mod config;
pub mod db;
pub mod domain;
pub mod error;
pub mod utils;
