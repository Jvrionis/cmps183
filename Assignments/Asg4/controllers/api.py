# Here go your api methods.

# @auth.requires_signature()
# def get_images():
#     id = request.vars.id
#     usr_images = db(db.usr_images.created_by == id).select()
#     return response.json(dict(
#         usr_images = usr_images
#     ))
#
# def get_user_image():
#     #start_idx = int(request.vars.start_idx) if request.vars.start_idx is not None else 0
#     #end_idx = int(request.vars.end_idx) if request.vars.end_idx is not None else 0
#
#     usr_images = []
#     image_url = db().select(db.user_images.ALL)
#     for i, r in enumerate(image_url):
#         #if i < end_idx - start_idx:
#         img = dict(
#             created_on=r.created_on,
#             created_by=r.created_by,
#             image_url=r.image_url
#         )
#         logger.info(img)
#         usr_images.append(img)
#     return response.json(dict(user_images=usr_images,
#                         ))

import tempfile

# Cloud-safe of uuid, so that many cloned servers 
# do not all use the same uuids.
from gluon.utils import web2py_uuid

#-------------------------------------------------------#
# Here go your api methods.
#-------------------------------------------------------#
@auth.requires_signature()
def add_image():
    image_id = db.usr_images.insert(
            image_url = request.vars.image_url
            )
    image = db.usr_images(image_id)
    return response.json( dict( image=image 
    ))
#-------------------------------------------------------#

#-------------------------------------------------------#
@auth.requires_signature()
def get_user_images():
    usr_images = []
    db_rows = db().select(db.usr_images.ALL)
    a = auth.user
    for i, r in enumerate(db_rows):
        img = dict(
                created_on = r.created_on,
                created_by = r.created_by,
                image_url  = r.image_url,
        )
        usr_images.append(img)

    return response.json(dict(
        usr_images  = usr_images
    ))
#-------------------------------------------------------#

#-------------------------------------------------------#
@auth.requires_signature()
def get_images():
    id = request.vars.id
    usr_images = db(
                db.usr_images.created_by == id).select()
    return response.json(dict(
        usr_images = usr_images
    ))
#-------------------------------------------------------#

#-------------------------------------------------------#
# Gets the current user
#-------------------------------------------------------#
@auth.requires_signature()
def get_cuser():
    user = []
    r = auth.user
    usr = dict(
        first_name = r.first_name,
        last_name = r.last_name,
        email = r.email,
        user_id = r.id,
    )
    user.append(usr)

    return response.json(dict(
        user = user
    ))
#-------------------------------------------------------#

#-------------------------------------------------------#
@auth.requires_signature()
def get_users():
    users = []
    # from piazza
    for r in db( 
            db.auth_user.id != auth.user.id ).select():
        usr = dict(
            first_name = r.first_name,
            last_name = r.last_name,
            email = r.email,
            user_id = r.id,
        )
        users.append(usr)

    return response.json(dict(
        users = users
    ))
#-------------------------------------------------------#
