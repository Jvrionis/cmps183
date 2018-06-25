# -*- coding: utf-8 -*-
# this file is released under public domain and you can use without limitations

# -------------------------------------------------------------------------
# This is a sample controller
# - index is the default action of any application
# - user is required for authentication and authorization
# - download is for downloading files uploaded in the db (does streaming)
# -------------------------------------------------------------------------
import os
from bottle import get, route, run, template, view, static_file

@route('/images/<filename:re:.*\.jpg>')
def serve_image(filename):
    return static_file(filename, root='images', mimetype='image/jpg')

@route('/images/<filename:re:.*\.png>')
def serve_image(filename):
    return static_file(filename, root='images', mimetype='image/png')

def index():
    """
    example action using the internationalization operator T and flash
    rendered by views/default/index.html or views/generic.html

    if you need a simple wiki simply replace the two lines below with:
    return auth.wiki()
    """
    logger.info('The session is: %r' % session)
    user_infos = None
    if auth.user is not None:
        user_infos = db((db.user_info.user_email == auth.user.email)|(db.user_info.is_public == "True")).select(db.user_info.ALL)
        scholarships = db().select(db.scholarships.ALL)
        return dict(user_infos=user_infos, scholarships = scholarships)
    elif auth.user is None:
        publiclists = db(db.user_info.is_public == True).select()
        return dict(publiclists=publiclists)
    if auth.user.email == "scholarship@admin.com":
        users = db().select(db.auth_user.ALL)
        return dict(users=users)

def see_users():

    user_info = db().select(db.user_info.ALL)
    scholarships = db().select(db.scholarships.ALL)
    return dict(user_info=user_info)

def view_scholarships():
    scholarships = db().select(db.scholarships.ALL)
    return dict(scholarships=scholarships)

def add_scholarship():
    """Adds a user_info."""
    form = SQLFORM(db.scholarships)
    if form.process(onvalidation=None).accepted:
        session.flash = T("scholarship added.")
        redirect(URL('default','index'))
    elif form.errors:
        session.flash = T('Please correct the info')
    return dict(form=form)


def no_swearing(form):
    if 'fool' in form.vars.race:
        form.errors.race = T('No swearing please')
    elif form.vars.gpa > 5:
        form.errors.gpa = T('Please enter a valid GPA')
    elif form.vars.phone > 9999999999 or form.vars.phone < 1000000000:
        form.errors.phone = T('Please enter a valid Phone Number')

def add():
    """Adds a user_info."""
    form = SQLFORM(db.user_info)
    if form.process(onvalidation=no_swearing).accepted:
        session.flash = T("Information added.")
        redirect(URL('default','index'))
    elif form.errors:
        session.flash = T('Please correct the info')
    return dict(form=form)

@auth.requires_login()
@auth.requires_signature()
def delete():
    if request.args(0) is not None:
        q = ((db.user_info.user_email == auth.user.email) &
             (db.user_info.id == request.args(0)))
        db(q).delete()
    redirect(URL('default', 'index'))

def toggle_public():
    if request.args(0) is not None:
        q = ((db.user_info.user_email == auth.user.email) &
            (db.user_info.id == request.args(0)))
        cl = db(q).select().first()
        if cl.is_public is False:
            cl.update_record(is_public = True)
        elif cl.is_public is True:
            cl.update_record(is_public = False)
    redirect(URL('default', 'index'))

@auth.requires_login()
def edit():
    """
    - "/edit/3" it offers a form to edit a user_info.
    'edit' is the controller (this function)
    '3' is request.args[0]
    """
    if request.args(0) is None:
        # We send you back to the general index.
        redirect(URL('default', 'index'))
    else:
        q = ((db.user_info.user_email == auth.user.email) &
             (db.user_info.id == request.args(0)))
        # I fish out the first element of the query, if there is one, otherwise None.
        cl = db(q).select().first()
        if cl is None:
            session.flash = T('Not Authorized')
            redirect(URL('default', 'index'))
        # Always write invariants in your code.
        # Here, the invariant is that the user_info is known to exist.
        # Is this an edit form?
        form = SQLFORM(db.user_info, record=cl, deletable=False)
        if form.process(onvalidation=no_swearing).accepted:
            # At this point, the record has already been edited.
            session.flash = T('Information edited.')
            redirect(URL('default', 'index'))
        elif form.errors:
            session.flash = T('Please enter correct values.')
    return dict(form=form)

def user():
    """
    exposes:
    http://..../[app]/default/user/login
    http://..../[app]/default/user/logout
    http://..../[app]/default/user/register
    http://..../[app]/default/user/profile
    http://..../[app]/default/user/retrieve_password
    http://..../[app]/default/user/change_password
    http://..../[app]/default/user/bulk_register
    use @auth.requires_login()
        @auth.requires_membership('group name')
        @auth.requires_permission('read','table name',record_id)
    to decorate functions that need access control
    also notice there is http://..../[app]/appadmin/manage/auth to allow administrator to manage users
    """
    return dict(form=auth())


@cache.action()
def download():
    """
    allows downloading of uploaded files
    http://..../[app]/default/download/[filename]
    """
    return response.download(request, db)


def call():
    """
    exposes services. for example:
    http://..../[app]/default/call/jsonrpc
    decorate with @services.jsonrpc the functions to expose
    supports xml, json, xmlrpc, jsonrpc, amfrpc, rss, csv
    """
    return service()
