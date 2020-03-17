use serde::Deserialize;

#[derive(Deserialize)]
pub struct ListQuery {
  pub offset: Option<i64>,
  pub limit: Option<i64>,
}
