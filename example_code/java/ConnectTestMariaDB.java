import java.sql.*;

public class ConnectTestMariaDB {
  public static void main(String args[]) throws Exception {
    if (args.length != 3) {
      throw new Error("Usage: java ConnectTest <user> <host> <password>");
    }
    String user = args[0];
    String host = args[1];
    String password = args[2];
    try {
      java.sql.Connection conn = DriverManager.getConnection(
        "jdbc:mariadb://" + host + ":4000/test?user=" + user + "&password=" + password + "&sslMode=verify-full&connectionAttributes=program_name:pingcap/serverless-test"
      );
      Statement stmt = conn.createStatement();
      try {
        ResultSet rs = stmt.executeQuery("SELECT DATABASE();");
        if (rs.next()) {
          System.out.println("using db: " + rs.getString(1));
        }
      } catch (Exception e) {
        throw e;
      }
    } catch (Exception e) {
      throw e;
    }
  }
}
