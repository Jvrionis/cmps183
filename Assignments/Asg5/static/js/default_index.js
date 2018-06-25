// // This is the js for the default/index.html view.

//--------------------------------------------------------------------------------------------
var app = function() {

    var self = {};

    Vue.config.silent = false; // show all warnings

    // Extends an array
    self.extend = function(a, b) {
        for (var i = 0; i < b.length; i++) {
            a.push(b[i]);
        }
    };

    // Enumerates an array.
    var enumerate = function(v) {
        var k=0;
        return v.map(function(e) {e._idx = k++;});
    };

    self.open_uploader = function () {
        $("div#uploader_div").show();
        self.vue.is_uploading = true;
    };

    self.close_uploader = function () {
        $("div#uploader_div").hide();
        self.vue.is_uploading = false;
        $("input#file_input").val(""); // This clears the file choice once uploaded.
        $("input#price_input").val("");
    };

      //get user's image urls
    function get_user_images_url(user_email) {
        var pp = {
            id: user_email,
        };
        return images_url + "?" + $.param(pp);
    };

     // gets the names of the users
    function get_users_name() {
        console.log("Get user url " + get_users);
        return get_users;
    };
//--------------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------------
    // add_fetched_images()
    // - New image' id will not be in vue.image_ids.
    function add_fetched_images(fetched_images) {
        console.log("Fetched Images: " + fetched_images.length);
        for (var i = 0; i < fetched_images.length; i++) {
            var image = fetched_images[i];
            if (!self.vue.images_ids.has(image.id)) {
                self.vue.images.push(image.image_url);
                console.log("add Image URLs: " + image.image_url);
                self.vue.images_ids.add(image.id);
            }
        }
    }
//--------------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------------
    // get_images()
    self.get_user_images = function() {
        $.getJSON(get_user_images_url(self.vue.current_user), function(data) {
            self.vue.has_more = data.has_more;
            self.vue.logged_in = data.logged_in;
            self.vue.user_email = data.user_email;
            self.vue.images = data.images;
        })
    };
//--------------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------------
    // get_users()
    self.get_users = function() {
        $.getJSON(get_users_name(), function(data) {
            self.vue.has_more = data.has_more;
            self.vue.logged_in = data.logged_in;
            self.vue.user_email = data.user_email;
            console.log("Current Users: " + data.user_email);
            console.log("Users: " + data.users);
            self.vue.images = data.images;
            console.log("Images: size: " + self.vue.images.length);
            self.vue.users = data.users;

            console.log('Images[] Size >>>: ' + self.vue.images.length);


        })
        // self.get_user_images();
    };
//--------------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------------
    self.select_user = function (id) {
        self.vue.current_user = id;
        console.log("Current User ID: " + id)
        self.get_user_images()
    }
//--------------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------------
    self.upload_file = function (event) {
        // Reads the file.
        var input = $("input#file_input")[0];
        var file =  input.files[0];
        var reader = new FileReader();

        reader.addEventListener("load", function () {
            self.vue.img_url = reader.result;
        }, false);

        if (file) {
            reader.readAsDataURL(file);
            // First, gets an upload URL.
            console.log("Trying to get the upload url");
            $.getJSON('https://upload-dot-luca-teaching.appspot.com/start/uploader/get_upload_url',
                function (data) {
                    // We now have upload (and download) URLs.
                    var put_url = data['signed_url'];
                    var get_url = data['access_url'];
                    console.log("Received upload url: " + put_url);
                    self.vue.put_img_url = put_url;
                    self.vue.get_url = get_url;
                    // Uploads the file, using the low-level interface.
                    var req = new XMLHttpRequest();
                    req.addEventListener("load", self.upload_complete(get_url));
                    // TODO: if you like, add a listener for "error" to detect failure.
                    req.open("PUT", put_url, true);
                    req.send(file);

                });
        }
    };
//--------------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------------
    // add_image
    self.add_image = function() {
        // console.log("Current User: " + data.user_email);
        created_on = new Date();
        console.log("Date: " +  created_on);
        console.log("Image URL: " + self.vue.get_url);

            $.post(add_image_url,
                {
                    created_by: 7,
                    created_on: new Date(),
                    image_url: self.vue.get_url,
                    price: self.vue.price
                }, function (data) {
                    self.vue.images_ids.add(data.user_images.id);
                    self.vue.img_url = data.user_images.image_url
                    console.log("Image: " + data.user_images.image_url);
                    console.log("Image ID: " + data.user_images.id);
                    console.log("Image ID: " + data.user_images.created_by);
                    }
            );
        console.log("Test6: " + self.vue.images_ids);

    };
//--------------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------------
    self.select_image = function(image_id) {
        // Inc and dec to desired quantity.
        console.log('select image ID >>>' + image_id);
        //console.log('select image Selected >>>: ' + self.vue.images[image_id].checked);
        //console.log('select image Selected >>>: ' + self.vue.images[image_id+1].checked);
        if (self.vue.images[image_id].checked) {
          self.vue.images[image_id].checked = false;
        } else {
          self.vue.images[image_id].checked = true;
        }
        console.log('select image Selected >>>: ' + self.vue.images[image_id].checked);
        // console.log('select image Selected >>>: ' + self.vue.images[image_id+1].checked);

        for (var i = 0; i < self.vue.images.length; i++) {
          console.log('selected image: ' + i + " "+ self.vue.images[i].checked);
        }

    };
//--------------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------------
    self.upload_complete = function(get_url) {
        // Hides the uploader div.
        self.vue.show_img = true;
        self.close_uploader();
        console.log('The file was uploaded; it is now available at ' + get_url);
        // TODO: The file is uploaded.  Now you have to insert the get_url into the database, etc.
        self.add_image();
        setTimeout(function() {
            // Executed after 1 seconds
            self.get_users();
        }, 1000);


    };
//--------------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------------
    self.checkout_images = function() {
        //
        self.vue.total = 0;
        self.vue.page = "cart";
        self.vue.images_cart = [];
        for (var i = 0; i < self.vue.images.length; i++) {
          if (self.vue.images[i].checked) {
             console.log('selected image: ' + i + " "+ self.vue.images[i].price);
             self.vue.images_cart.push(self.vue.images[i])
             self.vue.total = self.vue.total + self.vue.images[i].price;
          }
        }
        console.log('Total checkout: $' + self.vue.total);
        // prepares the form.
        self.stripe_instance = StripeCheckout.configure({
            key: 'pk_test_6JnIndPTZFCRv4uhxSCa7YEU',    //put your own publishable key here
            image: 'https://stripe.com/img/documentation/checkout/marketplace.png',
            locale: 'auto',
            token: function(token, args) {
                console.log('got a token. sending data to localhost.');
                self.stripe_token = token;
                self.customer_info = args;
                self.send_data_to_server();
            }
        });
        console.log('Strip: ' +self.stripe_instance);

        self.get_users();
    };
//--------------------------------------------------------------------------------------------
    self.store_cart = function() {
      localStorage.cart = JSON.stringify(self.vue.images_cart);
    };
//--------------------------------------------------------------------------------------------
    self.customer_info = {}
//--------------------------------------------------------------------------------------------
    self.goto = function (page) {
        self.vue.page = page;
        if (page == 'cart') {
            // prepares the form.
            self.stripe_instance = StripeCheckout.configure({
                key: 'pk_test_6JnIndPTZFCRv4uhxSCa7YEU',    //put your own publishable key here
                image: 'https://stripe.com/img/documentation/checkout/marketplace.png',
                locale: 'auto',
                token: function(token, args) {
                    console.log('got a token. sending data to localhost.');
                    self.stripe_token = token;
                    self.customer_info = args;
                    self.send_data_to_server();
                }
            });
        };

    };
//--------------------------------------------------------------------------------------------
    self.pay = function () {
        self.stripe_instance.open({
            name: "Your nice cart",
            description: "Buy cart content",
            billingAddress: true,
            shippingAddress: true,
            amount: Math.round(self.vue.total * 100),
        });
    };
//--------------------------------------------------------------------------------------------
    self.send_data_to_server = function () {
        console.log("Payment for:", self.customer_info);
        // Calls the server.
        $.post(purchase_url,
            {
                customer_info: JSON.stringify(self.customer_info),
                transaction_token: JSON.stringify(self.stripe_token),
                amount: self.vue.total,
                cart: JSON.stringify(self.vue.images_cart),
            },
            function (data) {
                if (data.result === "ok") {
                    // The order was successful.
                    self.vue.images_cart = [];
                    self.store_cart();
                    $.web2py.flash("Thank you for your purchase");
                } else {
                    $.web2py.flash("The card was declined.");
                }
            }
        );
    };
//--------------------------------------------------------------------------------------------
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            price: 0,
            file_input: null,
            logged_in: false,
            user_email: null,
            is_uploading: false,
            img_url: null,
            put_img_url: null,
            show_img: false,
            self_page: true,  // Leave it to true, so initially you are looking at your own images.
            current_id  : null,
            images: [],
            images_cart: [],
            total: 0,
            images_ids: new Set([]),
            images_id: null,
            page: "prod",
            users: [],
            users_ids: new Set([])


        },
        methods: {
            open_uploader: self.open_uploader,
            close_uploader: self.close_uploader,
            upload_file: self.upload_file,
            select_user: self.select_user,
            select_image: self.select_image,
            checkout_images: self.checkout_images,
            goto: self.goto,
            pay: self.pay
            //delete_image: self.delete_image
        }
    });

    self.get_users();
    $("#vue-div").show();

    return self;
};
//--------------------------------------------------------------------------------------------
var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});