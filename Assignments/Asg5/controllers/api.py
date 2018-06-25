import tempfile, hashlib


# Cloud-safe of uuid, so that many cloned servers do not all use the same uuids.
from gluon.utils import web2py_uuid
# Here go your api methods.

# SECRET_KEY = 'melanzana'
# def check ():
#     response.headers

def purchase():
    """Ajax function called when a customer orders and pays for the cart."""
    if not URL.verify(request, hmac_key=session.hmac_key):
        raise HTTP(500)
    # Creates the charge.
    import stripe
    # Your secret key.
    stripe.api_key = myconf.get('stripe.private_key')
    token = json.loads(request.vars.transaction_token)
    amount = float(request.vars.amount)
    try:
        charge = stripe.Charge.create(
            amount=int(amount * 100),
            currency="usd",
            source=token['id'],
            description="Purchase",
        )
    except stripe.error.CardError as e:
        logger.info("The card has been declined.")
        logger.info("%r" % traceback.format_exc())
        return response.json(dict(result="nok"))
    db.customer_order.insert(
        customer_info=request.vars.customer_info,
        transaction_token=json.dumps(token),
        cart=request.vars.cart)
    return response.json(dict(result="nok"))

def get_user_images():

    images = []

    has_more = False
    user_email = None
    is_public = True

    logged_in = auth.user is not None
    if logged_in:
        user_id = auth.user.id

    rows = db(db.user_images.created_by==request.vars.id).select()
    for index, row in enumerate(rows):
		image = dict(
			id=row.id,
			image_url=row.image_url,
		)
		images.append(image)

	# Return the query results.
    return response.json(dict(
    	images=images, logged_in=logged_in, user_email=user_email, has_more=has_more,))

def get_images():
	#start_index = int(request.vars.start_index) if request.vars.start_index is not None else 0
	#end_index = int(request.vars.end_index) if request.vars.end_index is not None else 0

    image_urls = []

    has_more = False
    user_email = None
    is_public = True

    logged_in = auth.user is not None
    if logged_in:
        user_email = auth.user.email

	rows = db(db.user_images.created_by == user_email).select()
	for index, row in enumerate(rows):
		if index < 21 - 1:
			# Add images corresponding to (start_index, end_index) to images.
			image = dict(
				id=row.id,
				image_url=row.image_url,
			)
			image_urls.append(image)

	# Return the query results.
    return response.json(dict(
    	images=image_urls, logged_in=logged_in, user_email=user_email, has_more=has_more,))


def get_users():

    users_names = []
    images_urls = []

    has_more = False
    user_email = None
    is_public = True

    logged_in = auth.user is not None
    if logged_in:
        user_email = auth.user.email

	rows = db(is_public).select(db.auth_user.ALL)
	for index, row in enumerate(rows):
		user= dict(
			id = row.id,
			first_name = row.first_name,
            last_name = row.last_name,
		)
		users_names.append(user)

    images = []
    users = []
    rows = db(db.user_images.created_by==auth.user.id).select()
    for i, row in enumerate(rows):
        image = dict(
            id  =  i,
            create_by = row.created_by,
            image_url = row.image_url,
            price = row.price,
            checked = False,
        )
        images.append(image)

	# Return the query results.
    return response.json(dict(users=users_names,
        images=images,
        logged_in=logged_in,
        user_email=user_email,
        has_more=has_more,))


def add_image():
    image_id = db.user_images.insert(

        image_url =request.vars.image_url,
        price     =request.vars.price,
        created_by=auth.user.id
    )
    user_images = dict(
        id=image_id,
        image_url=request.vars.image_url,
    )
    return response.json(dict(user_images=user_images,
    ))
