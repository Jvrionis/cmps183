# Define your tables below (or better in another model file) for example
#
# >>> db.define_table('mytable', Field('myfield', 'string'))
#
# Fields can be 'string','text','password','integer','double','boolean'
#       'date','time','datetime','blob','upload', 'reference TABLENAME'
# There is an implicit 'id integer autoincrement' field
# Consult manual for more options, validators, etc.

import datetime

def get_user_email():
    return auth.user.email if auth.user else None

db.define_table('usr_images',
                # Field('user_email', default=get_user_email()),
                # Field('title'),
                # Field('memo', 'text'),
                # Field('updated_on', 'datetime', update=datetime.datetime.utcnow()),
                # Field('is_public', 'boolean', default=False),
                Field('created_on', 'datetime', default=request.now),
                Field('created_by', 'reference auth_user', default=auth.user_id),
                Field('image_url')
                )

#
# db.user_images.created_on.writable = db.user_images.created_on.readable = False
# db.user_images.created_by.writable = db.user_images.created_by.readable = False
# db.user_images.user_email.writable = False
# db.user_images.user_email.readable = False
# db.user_images.updated_on.writable = db.user_images.updated_on.readable = False
# db.user_images.id.writable = db.user_images.id.readable = False
# db.user_images.is_public.writable = False
# db.user_images.is_public.readable = False

# db.define_table('checklist',
#                 Field('user_email', default=get_user_email()),
#                 Field('title'),
#                 Field('memo', 'text'),
#                 Field('updated_on', 'datetime', update=datetime.datetime.utcnow()),
#                 Field('is_public', 'boolean', default=False)
#                 )

# db.checklist.user_email.writable = False
# db.checklist.user_email.readable = False
# db.checklist.updated_on.writable = db.checklist.updated_on.readable = False
# db.checklist.id.writable = db.checklist.id.readable = False
# db.checklist.is_public.writable = False
# db.checklist.is_public.readable = False



# after defining tables, uncomment below to enable auditing
# auth.enable_record_versioning(db)
