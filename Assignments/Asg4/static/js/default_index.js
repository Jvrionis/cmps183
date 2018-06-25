// This is the js for the default/index.html view.


var app = function() {

    var self = {};

    Vue.config.silent = false; // show all warnings
//--------------------------------------------------------------------------------------------
    // Extends an array
    self.extend = function(a, b) {
        for (var i = 0; i < b.length; i++) {
            a.push(b[i]);
        }
    };
//--------------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------------
    // Enumerates an array.
    var enumerate = function(v) { 
        var k=0; return v.map(function(e) {e._idx = k++;}
        );
    };
//--------------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------------
    // Open uploader.
    self.open_uploader = function () {
        $("div#uploader_div").show();
        self.vue.is_uploading = true;
    };
//--------------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------------
    // clear the file once uploaded.
    self.close_uploader = function () {
        $("div#uploader_div").hide();
        self.vue.is_uploading = false;
        $("input#file_input").val(""); 

    };
//--------------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------------
    self.upload_file = function (event) {
        // Reads the file.
        var input = event.target;
        var file = input.files[0];
        // We want to read the image file, and transform it into a data URL.
        var reader = new FileReader();

        // We add a listener for the load event of the file reader.
        // The listener is called when loading terminates.
        // Once loading (the reader.readAsDataURL) terminates, we have
        // the data URL available.
        reader.addEventListener("load", function () {
            // An image can be represented as a data URL.
            // See https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
            // Here, we set the data URL of the image contained in the file to an image in the
            // HTML, causing the display of the file image.

            self.vue.img_url = reader.result;
        }, false);

        if (file) {
            // Reads the file as a data URL.
            reader.readAsDataURL(file);
            // Gets an upload URL.
            console.log("Trying to get the upload url");
            $.getJSON(
                'https://upload-dot-luca-teaching.appspot.com/start/uploader/get_upload_url',
                function (data) {
                    // We now have upload (and download) URLs.
                    var put_url = data['signed_url'];
                    var get_url = data['access_url'];
                    console.log("Received upload url: " + put_url);
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
    self.get_user_images = function () {
        $.getJSON(get_user_images_url, function (data) {
            self.vue.user_images = data.usr_images;
        })
    };
//--------------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------------
    self.select_user = function ( id ) {
        console.log(id);
        self.vue.main_user = id;
        self.vue.self_page = (id == self.vue.current_user[0].user_id);

        self.get_images(id);
    };

    self.get_images = function ( id ) {
            $.post(get_images_url,
                {
                    id: id
                },
                function (data) {
                    self.vue.user_images = data.usr_images;
                }
            );
    };
//--------------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------------
    self.get_cuser = function () {
        $.getJSON(get_cuser_url, function (data) {
            self.vue.current_user = data.user;
            enumerate(self.vue.current_user);
        })
    };
//--------------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------------
    self.get_users = function () {
        $.getJSON(add_users, function (data) {
            self.vue.users = data.users;
            enumerate(self.vue.users);
        })
    };

//--------------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------------
    self.upload_complete = function(get_url) {
        // Hides the uploader div.
        self.close_uploader();
        console.log('The file was uploaded; it is now available at ' + get_url);
        // The file is uploaded.  Now you have to insert the get_url into the database, etc.
        $.post(
            add_image_url,
            {
                image_url: get_url,
            },
            function(data){
                setTimeout( function(){
                    self.get_images(self.vue.current_user[0].user_id);
                }, 1000);
            }
        )
    };
 //--------------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------------
    self.click = function () {

    }
//--------------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------------
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            user_images: [],
            current_user: [],
            users: [],
            main_user: null,
            is_uploading: false,
            show_img: false,
            // Leave it to true, so initially you are looking at your own images.
            self_page: true 
        },
        methods: {
            get_user_images: self.get_user_images,
            close_uploader: self.close_uploader,
            open_uploader: self.open_uploader,
            upload_file: self.upload_file,
            select_user: self.select_user
        }

    });
//--------------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------------
    self.get_cuser();
    self.get_users();
    $("#vue-div").show();

    return self;
};
//--------------------------------------------------------------------------------------------


//--------------------------------------------------------------------------------------------
var APP = null;
//--------------------------------------------------------------------------------------------


//--------------------------------------------------------------------------------------------
// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});
//--------------------------------------------------------------------------------------------
