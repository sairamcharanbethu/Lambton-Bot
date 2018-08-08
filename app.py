from flask import Flask, render_template, request, jsonify, flash, redirect, url_for
import os, datetime, json,requests
from flaskext.mysql import MySQL
from wtforms import Form, validators, StringField
app = Flask(__name__)
app.config['SECRET_KEY'] = '7d441f27d441f27567d441f2b6176a'
mysql = MySQL()

# MySQL Configuration
app.config['MYSQL_DATABASE_USER'] = 'feedback'
app.config['MYSQL_DATABASE_PASSWORD'] = 'feedback'
app.config['MYSQL_DATABASE_DB'] = 'feedback'
app.config['MYSQL_DATABASE_HOST'] = '104.155.162.136'
mysql.init_app(app)


class Feedback(Form):
    name = StringField('Name:', validators=[validators.DataRequired()])
    email = StringField('Email:', validators=[validators.DataRequired(), validators.Length(min=2, max=35),validators.Email()])
    comments = StringField('Comments', validators=[validators.DataRequired(), validators.Length(min=1, max=600)])


@app.route('/')
@app.route('/index')
def index():
    return render_template('index.html')


@app.route('/chat', methods=["GET", "POST"])
def chat():
    """
    chat end point that performs NLU using rasa.ai
    and constructs response from response.py
    """
    user_message = request.form["text"]
    session_id = request.form["sessionId"]
    try:

        response = requests.post('http://35.211.139.242:5000/conversations/' + session_id + '/respond',
                                 json={"query": user_message})
        conn = mysql.connect()
        # response = requests.post('http://localhost:5004/conversations/default/respond', json={"query": user_message})
        response = response.json()
        bot = response[0]["text"]
        cursor = conn.cursor()
        cursor.execute('''INSERT INTO responses (user,bot) VALUES (%s,%s)''',
                       (user_message, bot))
        conn.commit()
        cursor.close()

        return jsonify({"status": "success", "response": response[0]["text"]})
    except Exception as e:
        print(e)
        return jsonify({"status": "success", "response": "Sorry I am not trained to do that yet..."})


@app.route('/feedback', methods=["GET", "POST"])
def feedback():
    form = Feedback(request.form)
    name = request.form['name']
    email = request.form['email']
    comments = request.form['comments']
    radio = request.form['options']
    conn = mysql.connect()
    if form.validate():
        # Save the comment here.
        cursor = conn.cursor()
        cursor.execute('''INSERT INTO user (name,email,comments,experience) VALUES (%s,%s,%s,%s)''', (name, email, comments, radio))
        conn.commit()
        cursor.close()
        flash('Thanks for giving feedback ' + name, '!')
    else:
        flash('Error: All the form fields are required.')
    conn.close()
    return redirect(url_for('index', _anchor='feedback'))


if __name__ == '__main__':
    app.run()

