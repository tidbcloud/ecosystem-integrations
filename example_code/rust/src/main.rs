use mysql::*;
use mysql::prelude::*;
use std::env;
use std::collections::HashMap;

fn main() {
    let args: Vec<String> = env::args().collect();
    let host = &args[1];
    let user = &args[2];
    let password = &args[3];

    let database_url = format!("mysql://{}:{}@{}:4000/test", &user, &password, &host);

    let ssl_opts = SslOpts::default();
    let mut connect_attrs = HashMap::new();
    connect_attrs.insert(String::from("program_name"), String::from("pingcap/serverless-test"));
    let builder = OptsBuilder::from_opts(Opts::from_url(&database_url).unwrap()).ssl_opts(ssl_opts).connect_attrs(Some(connect_attrs));
    let pool = Pool::new(builder).unwrap();

    let mut conn = pool.get_conn().unwrap();
    let val: Vec<String> = conn.query("SHOW DATABASES").unwrap();
    println!("{:?}", val)

}

