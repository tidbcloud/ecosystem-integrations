"""Exercise sample connection inputs without a database or real credentials."""
import os
from pathlib import Path
import runpy
import sys
import unittest
from unittest.mock import MagicMock, patch

ROOT = Path(__file__).resolve().parents[1]


class CredentialInputsTest(unittest.TestCase):
    def test_python_clients_read_password_from_environment(self):
        password = "test-'\"$()`\\@ password"
        cases = [
            ("ConnectTest_mysqlclient.py", "MySQLdb", "connect", {}),
            ("ConnectTest_pymysql.py", "pymysql", "connect", {}),
            ("ConnectTest_mysql-connector-python.py", "mysql.connector", "connect", {}),
            ("tls_version.py", "mysql.connector", "connect", {"tls_versions": ["TLSv1.3"]}),
        ]
        for filename, module, method, extra in cases:
            with self.subTest(filename=filename):
                client = MagicMock()
                modules = {module: client}
                if module == "mysql.connector":
                    parent = MagicMock()
                    parent.connector = client
                    modules["mysql"] = parent
                args = [filename, "db.example.com", "user", "/ca.pem"]
                if filename == "tls_version.py":
                    args = [filename, "db.example.com", "4000", "user", "/ca.pem", "TLSv1.3"]
                with patch.dict(sys.modules, modules), patch.dict(
                    os.environ, {"TIDB_PASSWORD": password}
                ), patch.object(sys, "argv", args), patch("builtins.print"):
                    runpy.run_path(str(ROOT / "example_code/python" / filename))
                call = getattr(client, method).call_args.kwargs
                self.assertEqual(call["password"], password)
                self.assertEqual(call["host"], "db.example.com")
                self.assertEqual(call["user"], "user")
                self.assertEqual(call.get("ssl_ca", call.get("ssl", {}).get("ca")), "/ca.pem")
                for key, value in extra.items():
                    self.assertEqual(call[key], value)


if __name__ == "__main__":
    unittest.main()
