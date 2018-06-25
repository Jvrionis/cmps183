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
    return auth.user.email if auth.user is not None else None
def get_first_name():
    return auth.user.first_name if auth.user is not None else None
def get_last_name():
    return auth.user.last_name if auth.user is not None else None

db.define_table('user_info',
                Field('user_email', default=get_user_email()),
                Field('first_name', default=get_first_name()),
                Field('last_name', default=get_last_name()),
                Field('phone', 'double'),
                Field('date_of_birth', 'datetime'),
                Field('address'),
                Field('city'),
                Field('zip'),
                Field('gpa','double'),
                Field('income','double'),
                Field('family_members','integer'),
                Field('race','string'),
                Field('updated_on', 'datetime', update=datetime.datetime.utcnow()),
                Field('is_public', 'boolean', default=False),
                Field('cover_letter','upload')
                )

db.define_table('scholarships',
                # Field('user_email'),
                Field('scholarship_name'),
                Field('information', 'text'),
                Field('scholarship_amount', 'double'),
                Field('contact_name'),
                Field('contact_email')
                )
db.user_info.user_email.writable = False
db.user_info.user_email.readable = False
db.user_info.updated_on.writable = db.user_info.updated_on.readable = False
db.user_info.id.writable = db.user_info.id.readable = False
db.user_info.is_public.writable = False
db.user_info.is_public.readable = False


db.user_info.date_of_birth.requires = IS_DATE(format=T('%d/%m/%Y'),
                                error_message='must be DD/MM/YYYY!')
db.user_info.zip.requires = IS_MATCH('^\d{5}(-\d{4})?$',
                                error_message='not a zip code')


# after defining tables, uncomment below to enable auditing
# auth.enable_record_versioning(db)
