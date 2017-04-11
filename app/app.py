from flask import Flask, flash, redirect, render_template, request, session, abort, url_for
import os
import requests
import json
from hotqueue import HotQueue

app = Flask(__name__)
queue = HotQueue("documentData", host="localhost", port=6379, db=0)

@app.route('/')
def index():
    if not session.get('logged_in'):
        return render_template('login.html')
    else:
        return redirect(url_for('home'))

@app.route('/home')
def home():
    return render_template('home.html')

@app.route('/login', methods=['POST'])
def do_admin_login():
    name = request.form['username']
    pwd = request.form['password']
    r = requests.post('http://stage2-appapisite-A.v.uc1.pspr.co/verification/v1/login', data={ "username": name, "password": pwd } )
    if r.status_code == requests.codes.ok:
        session['logged_in'] = True
        j = json.loads(r.text)
        session['token'] = 'bearer ' + j['access_token']
        print session['token']
    else:
        flash('wrong password!')
    return index()

@app.route("/fetch_image")
def fetch_image():
    data = queue.get()
    if data:
        jsonData = json.loads(data)
        print json.dumps(jsonData)
        if jsonData:
            return json.dumps(jsonData)
    else:
        return ""

@app.route("/accept_doc/<id>", methods=['GET'])
def accept(id):
    print "Accept Called"
    return ""

@app.route("/reject_doc/<id>", methods=['GET'])
def reject(id):
    print "Reject Called" + id
    token = session['token']
    if id:
        print "ID" + id
        print token
        r = requests.patch('http://stage2-appapisite-A.v.uc1.pspr.co/verification/v1/Documents/' + id, headers={"Authorization": token}, data={ "status": "Rejected", "progress_type": "Rejected"} )
        j = json.loads(r.text)
        print r.status_code
        if r.status_code == requests.codes.ok:
            #Send new document request
          workFlow = j['workflow_id']
          docType = j['type']
          token = session['token']
          response = requests.post('http://stage2-appapisite-A.v.uc1.pspr.co/verification/v1/Documents/' + str(workFlow) + '/Additional', headers={"Authorization": token}, data={ "type": docType} )
          return ""

@app.route("/logout")
def logout():
    session['logged_in'] = False
    return redirect(url_for('index'))

if __name__ == "__main__":
    app.secret_key = os.urandom(12)
    app.run(debug=True,host='0.0.0.0', port=4000)
