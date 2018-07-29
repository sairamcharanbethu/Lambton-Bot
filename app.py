from flask import Flask, render_template, request, jsonify, flash, redirect, url_for
import os, datetime, json
from wtforms import Form, validators, StringField
from wtforms.widgets import RadioInput
app = Flask(__name__)
app.config['SECRET_KEY'] = '7d441f27d441f27567d441f2b6176a'


class Feedback(Form):
    name = StringField('Name:', validators=[validators.required()])
    email = StringField('Email:', validators=[validators.required(), validators.Length(min=2, max=35)])
    comments = StringField('Comments', validators=[validators.required(), validators.Length(min=1, max=600)])



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
    session = request.form["session"]
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    try:
        print(session)
        response = request.post('http://35.227.119.207:5000/conversations/'+session+'/respond', json={"query": user_message})
        # response = requests.post('http://localhost:5004/conversations/default/respond', json={"query": user_message})
        response = response.json()
        return jsonify({"status": "success", "response": response[0]["text"]})
    except Exception as e:
        print(e)
        return jsonify({"status": "success", "response": "Sorry I am not trained to do that yet..."+session})


@app.route('/feedback', methods=["POST"])
def feedback():
    form = Feedback(request.form)
    print(form.errors)
    name = request.form['name']
    email = request.form['email']
    comments = request.form['comments']
    print(name, " ", email, " ", comments)
    if form.validate():
        # Save the comment here.
        flash('Thanks for giving feedback ' + name)
    else:
        flash('Error: All the form fields are required. ')

    return redirect(url_for('index'))


if __name__ == '__main__':
    app.run()

