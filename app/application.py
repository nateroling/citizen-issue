import json
import os
import sqlite3

from flask import Flask, redirect
from flask_restful import Resource, Api, reqparse
import ulid

app = Flask(__name__)

#
# Database
#

HERE = os.path.dirname(os.path.abspath(__file__))
DATABASE = os.path.join(HERE, 'db.sqlite3')

def query_db(query, args=(), one=False):
    """
    Run a query against the database. Results are returned as a dict per row.

    We re-connect to the database on every query. It's not efficient, but it's
    very tidy and perfectly adequate for the amount of traffic we need to
    handle.
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

def init_db():
    """
    Create the `issues` database table, if necessary. This is safe to run every
    time the app starts.

    Our schema consists of an ID and JSON-encoded data for each issue. The ID is
    a ULID, which is similar to a UUID except that we can sort by it.
    """
    query_db('CREATE TABLE IF NOT EXISTS issues (id text, data text)')


#
# API Objects & Routing
#

api = Api(app)

class IssueList(Resource):

    def __init__(self):
        self.parser = reqparse.RequestParser()
        self.parser.add_argument('type',     type=str, required=True)
        self.parser.add_argument('location', type=str, required=True)
        self.parser.add_argument('message',  type=str, required=True)
        self.parser.add_argument('name',     type=str, required=True)
        self.parser.add_argument('phone',    type=str, required=True)
        self.parser.add_argument('email',    type=str, required=True)

    def get(self):
        """
        Query the database and return an array of issues, each issue being a
        dict of the issue data along with the id.

        Issues are sorted from newest to oldest.
        """
        rows = query_db('SELECT * from issues ORDER BY id DESC')
        issues = []
        for row in rows:
            issue = json.loads(row['data'])
            issue['id'] = row['id']
            issues.append(issue)
        return issues
    
    def post(self):
        """
        Insert an issue into the database. Parse the provided JSON data to
        validate that we have the correct fields.

        Additional server-side validation is left for a future exercise.
        """
        args = self.parser.parse_args(strict=True)
        query_db('INSERT INTO issues(id, data) VALUES(?, ?)', (str(ulid.new()), json.dumps(args)))
        return { "message": "Success" }, 200

api.add_resource(IssueList, '/issues/')

@app.route("/")
def index():
    return redirect("/static/index.html")

#
# Startup
# 
# App will start in debug mode when this file is executed.
#
# Bind to 0.0.0.0 to access via exposed docker port
# https://stackoverflow.com/questions/7023052/configure-flask-dev-server-to-be-visible-across-the-network
#
if __name__ == '__main__':
    init_db() # Create db table (if necessary).
    app.run(host="0.0.0.0", debug=True)
