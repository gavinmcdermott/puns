(function() {

  // Gloabl Setup
  // 
  lib = window.lib || {};
  if (!lib.Request) {
    throw new Error('Shit is messed');
  }


  // Constants
  // 
  // App Credentials
  var APP_CREDENTIALS = {
    GOOG: {
      KEY: 'AIzaSyCxOxhESxfYsyrGiTgV-nZu8eR_XCAs1sM',
      CX: '006651638872240572518:paavvtnm18q'
    }
  };


  // Image Viewing/Handling Classes
  // 
  // Lightbox
  function LightboxViewer(images) {
    // TODO (Gavin): sanity check data

    // Lightbox State
    this.state = 'off';
    this.domId = "lb-background";
    // Keep track of the current image
    this.currentImageIndex = undefined;
    // Keep track of events
    this.eventHandlers = [];
    this.images = images;
  }

  LightboxViewer.prototype.viewImage = function(imageIndex) {
    // TODO (Vannaro): Add data sanity checking :)
    var background;
    var image;
    var imageWrapper;
    var title;

    var imageData = this.images[imageIndex];
    
    // Set the internal state
    this.currentImageIndex = imageIndex;

    // Handle showing or advancing the photos
    if (this.state === 'off') {
      this.open();

      background = document.getElementById(this.domId);
      imageWrapper = document.createElement("div");
      imageWrapper.setAttribute("id", "lb-viewer");
      
      image = document.createElement("img")
      image.setAttribute("src", imageData.link);
      image.setAttribute("id", "lb-image");
      image.setAttribute("alt", "Image of something sweet!");
      
      imageWrapper.appendChild(image);
      background.appendChild(imageWrapper);
    } else {
      image = document.getElementById('lb-image');
      image.setAttribute("src", imageData.link);

      title = document.getElementById("lb-imageTitle");
      title.textContent = this.images[this.currentImageIndex].title;
    }
  };

  LightboxViewer.prototype.trackKeypressHandler = function() {
    var self = this;
    var rightArrow = 39;
    var leftArrow = 37;  
    var escapeKey = 27;  

    function handler(evt) {
      var code = evt.keyCode;
      if (code === leftArrow) {
        self.prev();
      } else if (code === rightArrow) {
        self.next();
      } else if (code === escapeKey) {
        self.close();
      }
    }
    this.eventHandlers.unshift(handler);
    return handler;
  };

  LightboxViewer.prototype.open = function() {
    // Elements for appending
    var parent;
    var child;
    // Lightbox background
    var background;
    // Currnt image title
    var backgroundTitle;
    // Nav buttons
    var navWrapper;
    var prevNav;
    var nextNav;
    
    // Set state
    this.state = 'on';
    
    // Element Setup
    parent = document.getElementById("app");
    child = parent.firstChild;
    
    background = document.createElement("div");
    background.setAttribute("id", this.domId);
    
    backgroundTitle = document.createElement("H3");
    backgroundTitle.setAttribute("id", "lb-imageTitle");
    backgroundTitle.setAttribute("class", "u--textCenter");
    backgroundTitle.textContent = this.images[this.currentImageIndex].title;

    navWrapper = document.createElement("div");
    navWrapper.setAttribute("id", "lb-btnContainer");

    prevNav = document.createElement("span");
    prevNav.setAttribute("id", "lb-btn--prev");

    nextNav = document.createElement("span");
    nextNav.setAttribute("id", "lb-btn--next");
    
    // Add to DOM
    background.appendChild(backgroundTitle);
    background.appendChild(navWrapper);
    navWrapper.appendChild(prevNav);
    navWrapper.appendChild(nextNav);
    parent.insertBefore(background, child);

    // Register handlers    
    // Note: track keypresses on window so we can remove later
    document.addEventListener("keydown", this.trackKeypressHandler(), false);

    prevNav.addEventListener('click', function(evt) {
      evt.stopPropagation();
      this.prev();
    }.bind(this), false);

    nextNav.addEventListener('click', function(evt) {
      evt.stopPropagation();
      this.next();
    }.bind(this), false);

    background.addEventListener('click', function(evt) {
      evt.stopPropagation();
      this.close();
    }.bind(this), false);
  };

  LightboxViewer.prototype.close = function() {
    var background;
    var parent;

    // Reset internal state
    this.state = 'off';
    this.currentImageIndex = undefined;

    // Remove the background element
    parent = document.getElementById("app");
    background = document.getElementById(this.domId);
    parent.removeChild(background);

    // Remove all DOM event handlers
    for (var idx = 0; idx < this.eventHandlers.length; idx++) {
      document.removeEventListener("keydown", this.eventHandlers[idx]);
    }
  };

  LightboxViewer.prototype.prev = function() {
    if (this.currentImageIndex > 0) {
      this.viewImage(parseInt(this.currentImageIndex, 10) - 1);
    }
  };

  LightboxViewer.prototype.next = function() {
    if (this.currentImageIndex < this.images.length - 1) {
      this.viewImage(parseInt(this.currentImageIndex, 10) + 1);
    }
  };
  
  // Image Loading
  function ImageHandler() {
    this.images = [];
    this.lightboxViewer = undefined;
    // initialize a new intance
    this.init();
  }

  ImageHandler.prototype.registerClickHandler = function(element) {
    var self = this;
    element.addEventListener('click', function(evt) {
      evt.stopPropagation();
      var imgId = element.id;
      self.lightboxViewer.viewImage(imgId);
    }, false);
  };

  ImageHandler.prototype.attachThumbnailToDOM = function(image, id) {
    var container;
    var helper;
    var elem;
    
    // Element Setup
    container = document.createElement("span");
    container.setAttribute("class", "img-container");
    container.setAttribute("id", id);

    helper = document.createElement("span");
    helper.setAttribute("class", "img-inlineHelper");

    elem = document.createElement("img");
    elem.setAttribute("src", image.link);
    elem.setAttribute("class", "img-element");
    
    // DOM mutation
    container.appendChild(helper);
    container.appendChild(elem);
    document.getElementById("images").appendChild(container);
    
    // Register handlers
    this.registerClickHandler(container);
  };

  ImageHandler.prototype.addImages = function(images) {
    this.images = images;
    return this.images;
  };

  ImageHandler.prototype.init = function() {
    var handler = this;
    var request = new lib.Request();
    var params = {
      key: APP_CREDENTIALS.GOOG.KEY,
      cx: APP_CREDENTIALS.GOOG.CX,
      searchType: 'image',
      q: 'puns', // we care about quality content
      imgSize: 'large'
    };

    request.get(request.resources.google, params, 
      function(response) {
        if (response.data) {
          // add the images to the instance
          var images = handler.addImages(response.data.items);
          // instantiate a lightbox viewer
          handler.lightboxViewer = new LightboxViewer(images);
          // attach the thumbnails to the DOM
          images.forEach(function(image, idx) {
            handler.attachThumbnailToDOM(image, idx);
          });
        }
      },function(error) { console.log('ERR: ', error);}
    );
  };


  // App initialization
  // 
  function initApp() {
    // new ImageHandler();
  }
  initApp();

})();