use file_storage_server::domain::model::File;
use typescript_definitions::TypeScriptifyTrait;

fn main() {
  println!("{}", File::type_script_ify());
}
