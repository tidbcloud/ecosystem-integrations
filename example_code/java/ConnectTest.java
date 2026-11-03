import java.sql.*;

public class ConnectTest {
  public static void main(String args[]) throws Exception {
    if (args.length != 2) {
      throw new Error("Usage: java ConnectTest <user> <host> (set TIDB_PASSWORD)");
    }
    String user = args[0];
    String host = args[1];
    String password = System.getenv("TIDB_PASSWORD");
    try {
      java.sql.Connection conn = DriverManager.getConnection(
        "jdbc:mysql://" + host + ":4000/test?sslMode=VERIFY_IDENTITY&enabledTLSProtocols=TLSv1.2,TLSv1.3&connectionAttributes=program_name:pingcap/serverless-test", user, password
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
