import sqlite3
from flask import Flask
from flask_restful import Resource, Api, reqparse

app = Flask(__name__)



# Database setup.
# http://flask.pocoo.org/docs/0.12/patterns/sqlite3/
DATABASE = 'db.sqlite3'

def query_db(query, args=(), one=False):
    """
    We re-connect to the database on every query. It's not efficient, but it's
    very tidy and perfectly adequate for the tiny amount of traffic we need to
    handle.

    Results are returned as a generator that creates a dictioary for each row.
    """
    con = sqlite3.connect(DATABASE)
    con.row_factory = dict_factory
    cur = con.cursor()
    cur.execute(query, args)
    con.commit()
    rv = cur.fetchall()
    cur.close()
    con.close()
    return (rv[0] if rv else None) if one else rv

def dict_factory(cursor, row):
    """
    Create a column:value dictionary for an sqlite row. Used to return
    dictionaries when we query the database.
    """
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d



# API Objects & Routing
# http://flask-restful.readthedocs.io/en/latest/quickstart.html
api = Api(app)

class IssueList(Resource):

    def __init__(self):
        self.parser = reqparse.RequestParser()
        self.parser.add_argument('type',    type=str, required=True)
        self.parser.add_argument('message', type=str, required=True)
        self.parser.add_argument('name',    type=str, required=True)
        self.parser.add_argument('phone',   type=str, required=True)
        self.parser.add_argument('email',   type=str, required=True)

    def get(self):
        issues = query_db('SELECT * from issues')
        return issues
    
    def post(self):
        args = self.parser.parse_args(strict=True)
        try:
            query_db('INSERT INTO issues(type, message, name, phone, email) VALUES(:type, :message, :name, :phone, :email)', args)
        except Exception:
            return { "message": "An internal error occured." }, 500
        return { "message": "Success" }, 400

api.add_resource(IssueList, '/issues/')



# Start app in debug mode when this file is executed.
if __name__ == '__main__':
    query_db('CREATE TABLE IF NOT EXISTS issues (type text, message text, name text, phone text, email text)')
    app.run(debug=True)
