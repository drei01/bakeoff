var PAYMILL_PUBLIC_KEY = '1d4c0aea18d7e91b1d3bace6a4ba4845';


ko.bindingHandlers.htmlValue = {
    init: function(element, valueAccessor, allBindingsAccessor) {
        ko.utils.registerEventHandler(element, "keyup", function() {
            var modelValue = valueAccessor();
            var elementValue = element.innerHTML;
            if (ko.isWriteableObservable(modelValue)) {
                modelValue(elementValue);
                
            }
            else { //handle non-observable one-way binding
                var allBindings = allBindingsAccessor();
                if (allBindings['_ko_property_writers'] && allBindings['_ko_property_writers'].htmlValue) allBindings['_ko_property_writers'].htmlValue(elementValue);
            }
        }
                                     )
    },
    update: function(element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor()) || "";
        if (element.innerHTML !== value) {
            element.innerHTML = value;    
        }
    }
};

ko.bindingHandlers.easyPieChart = {
    update: function(element, valueAccessor, allBindingsAccessor) {
       var voteObject = valueAccessor();
       var winning = voteObject.percentageStatus() == 'winning';
       $(element).easyPieChart({
                    barColor: winning ? '#59A626' : '#C0BAB2',
                    trackColor: winning ? '#3C6F1A' : '#39383A',
                    scaleColor: false,
                    lineCap: 'butt',
                    rotate: -90,
                    size: 50,
                    lineWidth: 5,
                    animate: 1000
                });
    }
};

ko.bindingHandlers.fadeVisible = {
    init: function(element, valueAccessor) {
        // Initially set the element to be instantly visible/hidden depending on the value
        var value = valueAccessor();
        $(element).toggle(ko.utils.unwrapObservable(value)); // Use "unwrapObservable" so we can handle values that may or may not be observable
    },
    update: function(element, valueAccessor) {
        // Whenever the value subsequently changes, slowly fade the element in or out
        var value = valueAccessor();
        ko.utils.unwrapObservable(value) ? $(element).fadeIn() : $(element).fadeOut();
    }
};


var IngredientsList = function(showAdd){
	var self = this;
	self.items = ko.observableArray([]);
    self.itemToAdd = ko.observable("");
	self.ingredientsHeader = ko.observable("Ingredients");
	
	self.showAdd = showAdd;
	
	 self.addItem = function() {
        if (self.itemToAdd() != "") {
            self.items.push(self.itemToAdd());
            self.itemToAdd("");
        }
    };
    
    self.removeItem = function(item) {
        self.items.remove(item);
        self.items.valueHasMutated();
    };
    
    self.clear = function(){
    	self.items.removeAll();
	    self.itemToAdd("");
		self.ingredientsHeader("Ingredients");
    }
};

var IngredientListModel = function() {
	var self = this;
	var newBakeName = "";
	
    self.recipeUrl = ko.observable("");
    self.bakeName = ko.observable(newBakeName);
    self.bakeId = ko.observable("");
    self.description = ko.observable("");
    self.tagLine = ko.observable(null);
    self.ingredientsList = ko.observableArray([new IngredientsList(true)]);
    self.addIngredientsList = function(){
    	self.ingredientsList.push(new IngredientsList(false));
    };
    self.photoUrl = ko.observable("/images/new_recipe_placeholder.jpg");
    self.photoUrlSrc = ko.computed(function(){
    	if(self.photoUrl() == "/images/new_recipe_placeholder.jpg"){
    		return self.photoUrl();
    	}
    	return 'http://bakeoff-images.s3.amazonaws.com/'+self.photoUrl();
    });
    
    self.photoUploaded = function(){
    	return self.photoUrlSrc().indexOf('s3')>-1;
    };
    
    self.ready = function(){
    	return self.bakeName()!=newBakeName && self.photoUrl()!="";
    };
    
    self.parsingUrl = ko.observable(false);
    self.urlError = ko.observable(false);
    self.parseRecipe = function(){
    	if (self.recipeUrl() != "") {
	    	self.parsingUrl(true);
    		self.urlError(false);
    		
    		var url = "http://www.bbc.co.uk/food/recipes/"+self.recipeUrl();
    		
    		var response = $('<div>').crossDomain({
			    				url: url,
			    				success: function(){
			    					var headline = response.find('.article-title');
    		
						    		if(headline.length>0){
						    			self.recipeUrl("");
						    			self.parsingUrl(false);
						    			
						    			//set the recipe details
						    			self.bakeName(headline.text());
						    			
						    			var description = response.find('#preparation').html().replace(/\<br\>/gi,'\r');
						    			self.description(description);
						    			
						    			response.find('#ingredients li').each(function(key, value){
						    				self.ingredientsList()[0].items.push($(value).text());
						    				self.ingredientsList()[0].items.valueHasMutated();
						    			});
						    		}else{
						    			self.urlError(true);
						    		}
			    				},
			    				error: function(){
				    				self.parsingUrl(false);
			    					self.urlError(true);
			    				}
			    			});
        }
    }
    self.clear = function(){
    	$.each(self.ingredientsList(),function(key,list){
    		list.clear();
    	});		
	    self.recipeUrl("");
	    self.bakeName(newBakeName);
	    self.bakeId("");
	    self.description("");
	    self.tagLine(null);
	    self.photoUrl("/images/new_recipe_placeholder.jpg");
    }
};

var ProfileModel = function() {
	var self = this;
	self.userId = ko.observable("");
	self.name = ko.observable("");
	self.photo = ko.observable("");
	self.recipes = ko.observableArray();
	self.noRecipes = ko.observable(0);
	self.noLikes = ko.observable(0);
	self.noChallenges = ko.observable(0);
	self.notifications = ko.observableArray();
	self.sentChallenges = ko.observableArray();
	self.clear = function(){
		self.name("");
		self.photo("");
		self.recipes.removeAll();
		self.noRecipes(0);
		self.noLikes(0);
		self.noChallenges(0);
		self.notifications.removeAll();
		self.sentChallenges.removeAll();
	};
};

var FeedModel = {
	items: ko.observableArray(),
	count: ko.observable(1)
};

//view model for single recipe view
var RecipeModel = {
	bake : ko.observable({hasLiked:ko.computed(function(){return false;})}),
	user : ko.observable({}),
	recipe : ko.observable({}),
	challenge : ko.observable({})
};

var ChallengeModel = function(){
	var self = this;
	self.tagLine = ko.observable("");
	self.id = ko.observable("");
	self.photoUrl = ko.observable("");
	self.photoUrlSrc = function(){
		return 'http://bakeoff-images.s3.amazonaws.com/'+self.photoUrl()
	}
	self.ready = function(){
		return self.photoUrl()!="";
	};
	self.clear = function(){
		self.tagLine("");
		self.photoUrl("");
		self.id("");
		self.comment("");
		self.comments.removeAll();
	};
	self.comment = ko.observable("");
	self.comments = ko.observableArray();
};

var WelcomeModel = {
	whyFacebook: ko.observable(false),
	register: ko.observable(false),
	bakes: ko.observableArray()
};

var RegisterForm = function(){
	var self = this;
	self.name = ko.observable("");
	self.email = ko.observable("");
	self.password= ko.observable("");
	self.clear = function(){
		self.email("");
		self.password("");
		self.name("");
	};
};

var LoginForm = {
	email: ko.observable(""),
	password: ko.observable("")
};

var AddressForm = {
	to: ko.observable(""),
	line1: ko.observable(""),
	city: ko.observable(""),
	county: ko.observable(""),
	postcode: ko.observable(""),
	country: ko.observableArray(['United Kingdom','United States of America','Australia'])
};

var PostcardForm = function(){
	var self = this;
	self.bakeId= ko.observable("");
	self.recipeName= ko.observable("");
	self.imageUrl= ko.observable("");
	self.recipeId = ko.observable("");
	self.userId = ko.observable("");
	self.address= AddressForm;
	
	self.clear = function(){
		self.bakeId("");
		self.recipeName("");
		self.recipeId("");
		self.userId("");
		self.imageUrl("");
		self.address.line1("");
		self.address.city("");
		self.address.county("");
		self.address.postcode("");
	};
};

var ViewModel = {
	loggedIn : ko.observable(false),
	loading: ko.observable(false),
	bakeView: ko.observable(false),
	feedView: ko.observable(true),
	profileView: ko.observable(false),
	recipeView: ko.observable(false),
	userView: ko.observable(false),
	postcardAddressView: ko.observable(false),
	payView: ko.observable(false),
	welcomeModel: WelcomeModel,
	registerForm: new RegisterForm(),
	loginForm: LoginForm,
	postcardForm: new PostcardForm(),
	ingredientsModel: new IngredientListModel(),
	profileModel: new ProfileModel(),
	userModel: new ProfileModel(),
	feedModel: FeedModel,
	recipeModel : RecipeModel,
	challengeModel : new ChallengeModel()
};

ViewModel.bakeView.subscribe(function(newValue) {
    if(newValue==true){
    	_gaq.push(['_trackPageview', '/bakeoff/bake-view']);
        setTimeout(function(){BakeOff._scrollTo('#bakeHeader');},100);
    }
});

ViewModel.feedView.subscribe(function(newValue) {
    if(newValue==true){
    	_gaq.push(['_trackPageview', '/bakeoff/feed-view']);
    }
});

ViewModel.recipeView.subscribe(function(newValue) {
    if(newValue==true){
    	_gaq.push(['_trackPageview', '/bakeoff/recipe-view']);
    }
});

ViewModel.profileView.subscribe(function(newValue) {
    if(newValue==true){
    	_gaq.push(['_trackPageview', '/bakeoff/profile-view']);
    }
});

BakeOff = (function(){
	return{
		baseUrl : 'https://bakeapi-bakeoff.rhcloud.com',
		loginSubscription : null,
		hasLoaded : false,
		authToken : null,
		fbToken : null,
		feedPage : 0,
		userId : '',
		card : null,
		isMobile : navigator.userAgent.match(/Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile/i)!=null,
		loadingError: '<span class="alert alert-error">Looks like we are having some trouble. Sorry about that. Try <a href="javascript:window.location.reload();">refreshing the page.</a></span>',
		$loading : $('.loader'),
		_init:function(){
			var self = this;
			
			ko.applyBindings(ViewModel);
			
			ViewModel.loading(true);
				
			//subscribe to login state
			loginSubscription = ViewModel.loggedIn.subscribe(function(isLoggedIn){
				if(isLoggedIn){
					ViewModel.loading(false);
				}
			});
			
			FB.getLoginStatus(function(response) {
				if (response.status === 'connected') {
					self.fbToken = response.authResponse.accessToken;
					self._authenticate(response.authResponse.accessToken);
				}else {
					self._authenticateInternal(null,function(){//success
					},function(){//error
						$('#loading').replaceWith(BakeOff.loadingError);
					});
					if(!self.authToken){
						ViewModel.loading(false);
						Libs.init();
					}
				}
			});
		},
		_register: function(){
			var self = this;
			BakeOff._trackPage("/registerstart");
			var form = ViewModel.registerForm;
			$('#registerForm').removeClass('error');
			$('#registerForm .alert').hide();
			var hasError = false;
			
			if(form.name()==''){
				BakeOff._trackPage("/register/error/name");
				$('#registerForm .control-name').addClass('warning');
				hasError = true;
			}
			if(form.email()==''){
				BakeOff._trackPage("/register/error/email");
				$('#registerForm .control-email').addClass('warning');
				hasError = true;
			}
			if(form.password()==''){
				BakeOff._trackPage("/register/error/password");
				$('#registerForm .control-password').addClass('warning');
				hasError = true;
			}
			
			if(hasError){
				$('#registerForm .alert').html('<span>You must fill in all the fields.</span><br/><span>Your password must be 5 characters or more.</span>').show();
				return;
			}
			
			var button = new ButtonLoad($('#registerButton')[0]);
			button.start();
			
			$.ajax({
				type:"POST",
				url:self.baseUrl+'/register',
				data:JSON.stringify({
							name : form.name(),
							email : form.email(),
							password : form.password()
					}),
				contentType: 'application/json',
				complete: function(){
					button.reset();
				},
				success:function(response){
					if(response.meta.code==200){
						self.userId = response.data.id;
						BakeOff._setAuthToken(response.data.key);
						BakeOff._loadFeed();
						BakeOff.hasLoaded = true;
						
						BakeOff._trackPage("/registered");
						BakeOff._trackPage("/authenticate");
						
						BakeOff._notify('Contratulations! You are now logged in.');
					}
					ViewModel.registerForm.clear();
				},
				error:function(){
					BakeOff._notify("Something went wrong registering you.");
				}
			});
		},
		_login: function(){
			BakeOff._trackPage("/login");
			var self = this;
			
			ViewModel.loading(true);
			
			FB.login(function(response) {
		        if (response.authResponse) {
		        	BakeOff._trackEvent('Register','Complete','');
		            self._authenticate(response.authResponse.accessToken);
		        }else{
		        	ViewModel.loading(false);
		        	BakeOff._notify("Something went horribly wrong logging you in. Fancy trying again old chum?");
		        }
		    },{scope: 'email'});
		},
		_authenticate: function(facebookAuthToken){
			var self = this;
			
			self.fbToken = facebookAuthToken;
			
			BakeOff._authenticateInternal({auth_token : facebookAuthToken},function(){//success
			},function(){//error
				$('#loading').replaceWith(BakeOff.loadingError);
			});
		},
		_authenticateWithForm: function(form){
			$('#formLogin .alert-block').hide();
			var button = new ButtonLoad($('#loginFormButton')[0]);
			button.start();
			
			BakeOff._authenticateInternal({
				email : form.email(),
				password : form.password()
			},function(){//success
				button.end();
			},function(){//error
				button.end();
				$('#formLogin .alert-block').show();
			});

		},
		_authenticateInternal: function(credentials,successCallback,errorCallback){
			var self = this;
			if (Modernizr.localstorage) {
				var key = localStorage.getItem("bakeoff_key");
				var id = localStorage.getItem("bakeoff_id");
				if(key!=null && key!="" && id!=null && id!=""){
					BakeOff._setAuthToken(key,id);
					BakeOff._loadFeed();
					BakeOff._trackPage("/reauthenticated");
					return;
				}
			}
			
			if(!credentials){
				return;
			}
			
			BakeOff._trackPage("/authenticate");
			
			$.ajax({
				type:"POST",
				url:self.baseUrl+'/authenticate',
				data:JSON.stringify(credentials),
				contentType: 'application/json',
				success:function(response){
					if(response.meta.code==200){
						BakeOff._setAuthToken(response.data.key,response.data.id);
						BakeOff._loadFeed();
						BakeOff.hasLoaded = true;
						
						BakeOff._trackPage("/authenticated");
					}
					
					$('iframe.media_video').remove();
					
					if(successCallback){
						successCallback();
					}
				},
				error:function(){
					if(errorCallback){
						errorCallback();
					}
					BakeOff._notify("Something went wrong logging you in.");
				}
			});
		},
		_setAuthToken: function(token,userId){
			var self = this;
			self.authToken = token;
			self.userId = userId;
			ViewModel.loggedIn(true);
			self._loadFeed();
			self._getChallenges();
			
			Libs.init();
			
			if (Modernizr.localstorage) {
				localStorage.setItem("bakeoff_key", self.authToken);
				localStorage.setItem("bakeoff_id", self.userId); 
			}
		},
		_getChallenges: function(){
			var self = this;
			$.ajax({
				type:"GET",
				url:self.baseUrl+'/user/SELF/challenges?key='+self.authToken,
				contentType: 'application/json',
				success:function(response){
					ViewModel.profileModel.notifications(response.data.challenges);
					ViewModel.profileModel.sentChallenges(response.data.sentChallenges);
					
					bootstrapnojquery.initDropdown($('.challenge-toggle')[0]);
				},
				error:function(){
					BakeOff._notify("Something went wrong getting your challenges");
				}
			});
		},
		_logout: function(){
			BakeOff._trackPage("/logout");
			var self = this;
			
			if (Modernizr.localstorage) {
				localStorage.removeItem("bakeoff_key");
				localStorage.removeItem("bakeoff_id");
			}
			
			if(self.fbToken!=null){
				FB.logout(function(response) {
					ViewModel.loggedIn(false);
					location.href='/';
				});	
			}else{
				ViewModel.loggedIn(false);
				location.href='/';
			}			
		},
		_loadFeed: function(){
			var self = this;
			location.href= '/#!/';
			$.ajax({
				type:"GET",
				url:self.baseUrl+'/user/SELF/feed?key='+self.authToken+'&page='+self.feedPage,
				contentType: 'application/json',
				success:function(response){
					response.data.bakes.reverse();
					$.each(response.data.bakes,function(key, item){
						item.bake.prettyDate = ko.computed(function(){
							return moment(item.bake.date).fromNow();
						});
						
						if(item.bake.likes==null){
							item.bake.likes = [];
						}
						
						item.bake.likes = ko.observable(item.bake.likes);
						
						item.bake.hasLiked = ko.computed(function(){
							var match = ko.utils.arrayFirst(item.bake.likes(), function(item) {
							    return self.userId === item.userId;
							});
							
							return match;
						});
						
						if(item.bake.votes==null){
							item.bake.votes = [];
						}
						
						if(item.challengeBake){
							if(item.challengeBake.votes==null){
								item.challengeBake.votes = [];
							}
							
							item.bake.percentage = ko.computed(function(){
								var total = item.bake.votes.length + item.challengeBake.votes.length;
								if(total == 0){
									total = 0;
								}
								return ((item.bake.votes.length / total) * 100).toFixed(0);
							});
							
							item.challengeBake.percentage = ko.computed(function(){
								var total = item.bake.votes.length + item.challengeBake.votes.length;
								if(total == 0){
									total = 0;
								}
								return ((item.challengeBake.votes.length / total) * 100).toFixed(0);

							});
							
							item.bake.percentageStatus = ko.computed(function(){
								return item.bake.percentage() > item.challengeBake.percentage() ? 'winning' : 'losing';
							});
							
							item.challengeBake.percentageStatus = ko.computed(function(){
								return item.challengeBake.percentage() > item.bake.percentage() ? 'winning' : 'losing';
							});
							
							item.bake.hasVoted = ko.computed(function(){
								var hasVoted = false;
								item.bake.votes.forEach(function(id){
									if(id == self.userId){
										hasVoted = true;
										return true;
									}
								});
								return hasVoted;
							});
							
							item.challengeBake.hasVoted = ko.computed(function(){
								var hasVoted = false;
								item.challengeBake.votes.forEach(function(id){
									if(id == self.userId){
										hasVoted = true;
										return true;
									}
								});
								return hasVoted;
							});
							
							item.bake.voteIcon = ko.computed(function(){
								return item.bake.hasVoted() ? 'icon-ok' : 'icon-thumbs-up';
							});
							
							item.challengeBake.voteIcon = ko.computed(function(){
								return item.challengeBake.hasVoted() ? 'icon-ok' : 'icon-thumbs-up';
							});


						}
						
						$.each(item.bake.comments,function(key,comment){
							comment.prettyDate = ko.computed(function(){
								return moment(comment.date).fromNow();
							});
						});
						
						item.bake.comments = ko.observableArray(item.bake.comments);
						
						ViewModel.feedModel.items.push(item);
					}); 
					
					ViewModel.feedModel.count(response.data.count);
					
					self.feedPage++;
				},
				error:function(){
					BakeOff._notify("Something went wrong loading the feed");
					$('.spinner').replaceWith('<div class="alert alert-error"><strong>Something went wrong loading the feed</strong></div>');
					$('#newRecipe').hide();
				}
			});
			
			try{
				if(!window.paypal){
					$.getScript('//cdnjs.cloudflare.com/ajax/libs/minicart/3.0.5/minicart.min.js',function(){
						paypal.minicart.render();
					});
				}
			}catch(err){}
		},
		_startBake: function(){
			Libs.loadFilepicker();//load the file picker if required
			
			location.href= '/#!/';
			
			var self = this;
			ViewModel.ingredientsModel.clear();
			ViewModel.profileView(false);
			ViewModel.bakeView(true);
			ViewModel.feedView(false);
			ViewModel.recipeView(false);
			ViewModel.userView(false);
			ViewModel.postcardAddressView(false);
			
			/*$('#recipeName').typeahead({
			    source: function (typeahead, query){
			    	$.getJSON(self.baseUrl+'/recipe/search?key='+self.authToken,function(response){
			    		typeahead.process(response.data);
			    	});
			    },
			    property: "title",
			    onselect: function (obj) {
			      	ViewModel.ingredientsModel.bakeId(obj.id);
			    }
			
			  });*/
		},
		_finishBake: function(){
			BakeOff._trackPage("/bake/create");
			var button = new ButtonLoad($('#bakeButton')[0]);
			button.start();
		
			var self = this;
			var bake = {};
			bake.title = ViewModel.ingredientsModel.bakeName();
			bake.description = ViewModel.ingredientsModel.description().replace(/\n/g, '<br />');
			bake.ingredients = [];
			
			var i = 0;
			for(var index in ViewModel.ingredientsModel.ingredientsList()){
				var list = ViewModel.ingredientsModel.ingredientsList()[i];
				bake.ingredients[i] = {};
				bake.ingredients[i].ingredientsHeader = list.ingredientsHeader();
				bake.ingredients[i].ingredients = list.items();
				i++;
			}			
			
			$.ajax({
				type:"POST",
				url:self.baseUrl+'/recipe/create?key='+self.authToken,
				data:JSON.stringify(
							{
								recipe : bake,
								photoUrl : ViewModel.ingredientsModel.photoUrlSrc(),
								tagLine : ViewModel.ingredientsModel.tagLine()
							}),
				contentType: 'application/json',
				success:function(response){
					if(response.meta.code==200 && response.data.bake){
						bake = response.data.bake;
						//success! add the new bake to the list and show our list
						ViewModel.profileModel.recipes.unshift(bake);
						self._viewProfile();
						
						BakeOff._showOverlay('icon-heart','Bake complete!',bake);
						
						BakeOff._trackEvent('Bake','Complete',bake.id);
					}else{
						BakeOff._notify("Your recipe seemed to save ok but we can't find your picture.");
					}
				},
				error:function(){
					BakeOff._notify("Something went wrong saving your bake. Try saving it again");
				},
				complete:function(){
					button.end();
				}
			});
		},
		_viewProfile: function(){
			var self = this;
			
			location.href="#";
			
			if(ViewModel.profileModel.name() == ""){
				BakeOff.$loading.show();
				//PROFILE
				$.ajax({
					type:"GET",
					url:self.baseUrl+'/user/SELF/profile?key='+self.authToken,
					contentType: 'application/json',
					success:function(response){
						ViewModel.profileModel.name(response.data.user.firstName+" "+response.data.user.lastName);
					    ViewModel.profileModel.photo(response.data.user.profilePhoto);
						ViewModel.profileModel.noRecipes(response.data.noRecipes);
						ViewModel.profileModel.noChallenges(response.data.noChallenges);
						ViewModel.profileModel.noLikes(response.data.noLikes);
					
						$.each(response.data.bakes,function(key, bake){
							ViewModel.profileModel.recipes.push(bake);
						});
						
						try{
							Raven.setUser({
							    email: response.data.user.emailAddress,
							    id: response.data.user.id
							})
						}catch(err){}
						
						window.intercomSettings = {
						    email: response.data.user.emailAddress,
						    created_at: response.data.user.createDate,
						    app_id: "28c841f8a1fc5565348b0b6a5f74bc45349be87e",
						    "noRecipes": response.data.noRecipes,
						    "noChallenges": response.data.noChallenges,
						    "noLikes": response.data.noLikes,
						    "firstName": response.data.user.firstName,
						    "lastName": response.data.user.lastName
						};
						
						Libs.loadIntercom();
					},
					error:function(){
						BakeOff._notify("Something went wrong getting your bakes");
					},
					complete:function(){
						BakeOff.$loading.hide();
					}
				});
			}
		
			ViewModel.profileView(true);
			ViewModel.feedView(false);
			ViewModel.bakeView(false);
			ViewModel.recipeView(false);
			ViewModel.userView(false);	
			ViewModel.postcardAddressView(false);		
		},
		_viewFeed: function(bakeId){
			ViewModel.profileView(false);
			ViewModel.bakeView(false);
			ViewModel.feedView(true);
			ViewModel.recipeView(false);
			ViewModel.userView(false);
			ViewModel.postcardAddressView(false);
		},
		_pickFile: function(destination){
			Libs.loadFilepicker(function(){
				filepicker.pick({
					mimetypes: ['image/*'],
					container: 'modal',
					services:['COMPUTER', 'WEBCAM', 'INSTAGRAM', 'FLICKR']
					},
					
					function(FPFile){
						destination(FPFile.key);
						filepicker.convert(FPFile, {width: 600, height: 500 , fit: 'max' , format: 'jpg'},function(cropped_FPFile){
							destination(FPFile.key);
						});
					},
					
					function(FPError){
						//console.log(FPError.toString());
						BakeOff._notify("Something went wrong choosing your photo. Fancy giving it another go?");
					}
				);
			});
		},
		_showRecipe: function(recipeId,userId){
			BakeOff.$loading.show();
			BakeOff._trackPage("/recipe/"+recipeId);
			ViewModel.challengeModel.clear();
			ViewModel.recipeModel.challenge({});
			var self = this;
			ViewModel.profileView(false);
			ViewModel.bakeView(false);
			ViewModel.feedView(false);
			ViewModel.userView(false);
			ViewModel.postcardAddressView(false);
			ViewModel.recipeView(true);
			
			
			$.ajax({
				type:"GET",
				url:self.baseUrl+'/recipe/'+recipeId+'/'+userId+'?key='+self.authToken,
				contentType: 'application/json',
				success:function(response){
					ViewModel.recipeModel.user(response.data.user);
					var bake = response.data.bake;
					if(!bake.likes){
						bake.likes = [];
					}
					bake.hasLiked = ko.computed(function(){
							var match = ko.utils.arrayFirst(bake.likes, function(item) {
							    return self.userId === item.userId;
							});
							
							return match;
						});
					ViewModel.recipeModel.bake(bake);
					ViewModel.recipeModel.recipe(response.data.recipe);
					ViewModel.challengeModel.comments.removeAll();
					$.each(bake.comments,function(key, comment){
						comment.prettyDate = ko.computed(function(){
							return moment(comment.date).fromNow();
						});
	
						ViewModel.challengeModel.comments.push(comment);
					});
					ViewModel.recipeModel.challenge({});
					ViewModel.recipeModel.recipe.ingredients = ko.observableArray(ViewModel.recipeModel.recipe.ingredients);				},
				error:function(){
					BakeOff._notify("Something went wrong loading the recipe. Try refreshing.");
				},
				complete:function(){
					BakeOff.$loading.hide();
				}
			});
		},
		_showChallenge: function(challengeId){
			BakeOff.$loading.show();
			BakeOff._trackPage("/challenge/"+challengeId);
			var self = this;
			ViewModel.profileView(false);
			ViewModel.bakeView(false);
			ViewModel.feedView(false);
			ViewModel.userView(false);
			ViewModel.postcardAddressView(false);
			ViewModel.recipeView(true);
			
			$.ajax({
				type:"GET",
				url:self.baseUrl+'/challenge/'+challengeId+'?key='+self.authToken,
				contentType: 'application/json',
				success:function(response){
					ViewModel.recipeModel.user(response.data.user);
					var bake = response.data.challenge.bake;
					if(!bake.likes){
						bake.likes = [];
					}
					bake.hasLiked = ko.computed(function(){
							var match = ko.utils.arrayFirst(bake.likes, function(item) {
							    return self.userId === item.userId;
							});
							
							return match;
						});
					ViewModel.recipeModel.bake(bake);
					ViewModel.recipeModel.challenge(response.data.challenge);
					ViewModel.recipeModel.recipe(response.data.recipe);
					ViewModel.recipeModel.recipe.ingredients = ko.observableArray(ViewModel.recipeModel.recipe.ingredients);
					ViewModel.challengeModel.clear();
					ViewModel.challengeModel.id(challengeId);
					$.each(response.data.challenge.comments,function(key,comment){
						comment.prettyDate = ko.computed(function(){
							return moment(comment.date).fromNow();
						});
	
						ViewModel.challengeModel.comments.push(comment);
					});
				},
				error:function(){
					BakeOff._notify("Something went wrong loading the challenge. Try refreshing.");
				},
				complete:function(){
					BakeOff.$loading.hide();
				}
			});
		},
		_challenge: function(bakeId,recipeName,recipeId,pictureSrc){
			BakeOff._trackPage("/bake/"+bakeId+"/challenge");
			var self = this;
			
			if(self.fbToken==null){//must auth with Facebook to send a challenge
				FB.login(function(response) {
		        	if (response.authResponse) {
		        		BakeOff._challenge(bakeId,recipeName,recipeId,pictureSrc);
		        	}
		        });
		        return;
			}
			
			FB.ui({method: 'apprequests',
			    message: 'I challenge you to make '+recipeName,
			    display: self.isMobile?'touch':'',
			    title: 'Select Friends to challenge on BakeOff',
			    max_recipients:1
			  }, function(response){			  
			  	if(response && response.to.length>0){
			  		var toId = response.to[0];
			  		FB.api('/'+toId, function(response) {
					  //send the challenge to the server			  		
				  		$.ajax({
							type:"POST",
							url:self.baseUrl+'/bake/'+bakeId+'/challenge?key='+self.authToken,
							data:JSON.stringify({
												facebookId:toId,
												name:response.name
											}),
							contentType: 'application/json',
							success:function(response){
								if(response.meta.code==200){
									var challengeUrl = 'http://www.bakeoff.co/!#challenge/'+response.data.id;
							  		FB.ui({
							          method: 'feed',
							          to: toId,
							          link: challengeUrl,
							          picture: pictureSrc.indexOf('s3')==-1?'http://bakeoff-images.s3.amazonaws.com/'+pictureSrc:pictureSrc,
							          display: self.isMobile?'touch':'',
							          name: 'BakeOff Challenge',
							          caption: 'You have been challenged!',
							          actions: {name:'Accept',link:challengeUrl},
							          description: 'Your friend '+ViewModel.profileModel.name()+' has challenged you to make '+recipeName+'. Click to accept the challenge.'
							        }, function(response){
							        	if(response.post_id){
							        		BakeOff._notify("We have whisked your challenge over to your buddy. Sit back, relax and await the results!");
							        	}
							        });
								}
							},
							error:function(){
								BakeOff._notify("Something went wrong saving your challenge");
							}
						});	
					});
		  		}
		  });
		},
		_commentChallenge: function(){
			BakeOff._trackPage("/challenge/"+ViewModel.challengeModel.id()+"/comment");
			var comment = ViewModel.challengeModel.comment();
			var button = new ButtonLoad($('#challengeCommentButton')[0]);
			button.start();
		
			var self = this;
						
			$.ajax({
				type:"POST",
				url:self.baseUrl+'/challenge/'+ViewModel.challengeModel.id()+'/comment?key='+self.authToken,
				data:JSON.stringify({comment : comment}),
				contentType: 'application/json',
				success:function(response){
					if(response.meta.code==200 && response.data.comment){
						var comment = response.data.comment;
						comment.prettyDate = ko.computed(function(){
							return moment(comment.date).fromNow();
						});
						ViewModel.challengeModel.comments.push(comment);
						ViewModel.challengeModel.comment("");
					}
				},
				error:function(){
					BakeOff._notify("Something went wrong saving your comment. Try saving it again");
				},
				complete:function(){
					button.end();
				}
			});
		},
		_commentBake: function(id,commentAttr,comments,button,onFeed){
			BakeOff._trackPage("/bake/"+id+"/comment");
			var buttonLoad = new ButtonLoad($(button)[0]);
			buttonLoad.start();
			
			var comment = commentAttr();	
			var self = this;
						
			$.ajax({
				type:"POST",
				url:self.baseUrl+'/bake/'+id+'/comment?key='+self.authToken,
				data:JSON.stringify({comment : comment}),
				contentType: 'application/json',
				success:function(response){
					if(response.meta.code==200 && response.data.comment){
						var comment = response.data.comment;
						comment.prettyDate = ko.computed(function(){
							return moment(comment.date).fromNow();
						});
						comments.push(comment);
						commentAttr("");
						
						if(!onFeed){
							//update the feed
							ko.utils.arrayForEach(ViewModel.feedModel.items(), function(item) {
						        if(item.bake.id===id){
									item.bake.comments().push(comment);
									item.bake.comments.valueHasMutated();
									return false;
								}
						    });
					    }
					}
				},
				error:function(){
					BakeOff._notify("Something went wrong saving your comment. Try saving it again");
				},
				complete:function(){
					buttonLoad.end();
				}
			});

		},
		_likeBake: function(id,bake){
			var self = this;
			BakeOff._trackPage("/bake/"+id+"/like");
			$.ajax({
				type:"POST",
				data: JSON.stringify({}),
				url:self.baseUrl+'/bake/'+id+'/like?key='+self.authToken,
				contentType: 'application/json',
				success:function(response){
					if(response.meta.code==200 && response.data.like){
						bake.likes().push(response.data.like);
						bake.likes.valueHasMutated();
					}
				},
				error:function(){
					
				}
			});
		},
		_finishChallenge: function(){
			var button = new ButtonLoad($('#challengeButton')[0]);
			button.start();
		
			var self = this;
			
			var url = '/challenge/'+ViewModel.recipeModel.challenge().id+'/complete';
			if(ViewModel.challengeModel.id()==""){
				url = '/recipe/'+ViewModel.recipeModel.recipe().id+'/bake';
			}
			
						
			$.ajax({
				type:"POST",
				url:self.baseUrl+url+'?key='+self.authToken,
				data:JSON.stringify(
							{
								photoUrl : ViewModel.challengeModel.photoUrlSrc(),
								tagLine : ViewModel.challengeModel.tagLine()
							}),
				contentType: 'application/json',
				success:function(response){
					if(response.meta.code==200 && response.data.recipeId){
						BakeOff._getChallenges();
						location.href='#!recipe/'+response.data.recipeId+'/SELF'
						BakeOff._notify("Wohoo! All done.");
					}else{
						BakeOff._notify("Your recipe seemed to save ok but we can't find your picture.");
					}
				},
				error:function(){
					BakeOff._notify("Something went wrong saving your bake. Try saving it again");
				},
				complete:function(){
					button.end();
				}
			});
		},
		_showComments: function(bakeId){
			$('.comments-'+bakeId+' li').removeClass('comment-hideable');
			$('.more-comments-'+bakeId).hide();
		},
		_postcard: function(bakeId,title,imageUrl,recipeId,userId){
			BakeOff._trackPage('/postcard/'+bakeId);
			
			//window.location.href = 'https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=QG82M75G7P934&item_name=' + title;
			
			paypal.minicart.cart.add({ "business": "mcreidie@hotmail.com", "item_name": title, "amount": 2.99, "currency_code": "GBP" });
			
			/*
		
			ViewModel.postcardForm.clear();
			
			ViewModel.postcardForm.bakeId(bakeId);
			ViewModel.postcardForm.recipeName(title);
			ViewModel.postcardForm.imageUrl(imageUrl);
			ViewModel.postcardForm.recipeId(recipeId);
			ViewModel.postcardForm.userId(userId);
		
			ViewModel.profileView(false);
			ViewModel.bakeView(false);
			ViewModel.feedView(false);
			ViewModel.recipeView(false);
			ViewModel.userView(false);
			ViewModel.postcardAddressView(true);
			*/
		},
		_pay: function(){
			ViewModel.postcardAddressView(false);
			ViewModel.payView(true);
			
			var self = this;
			self._trackPage('/postcard/page/'+ViewModel.postcardForm.bakeId());
			if(!window.paymill){//check if paymill js is already loaded
				$.getScript('https://bridge.paymill.com/',function(){//success
					self._loadPay();				
				},function(){//error
					BakeOff._notify('Something went wrong loading the payment form.');
				});
			}else{
				self._loadPay();	
			}
		},
		_loadPay: function(){
			var self = this;
			//show the payment form
			self._validatePayInput('#payForm #cc_number',16,'validateCardNumber','card number',function(cardNum){
				$('.card-types img').removeClass('greyscale');
				var cardType = paymill.cardType(cardNum);
				switch(cardType){
					case 'Visa':
						$('.card-types img').addClass('greyscale');
						$('.card-types #visa').removeClass('greyscale');
						break;
					case 'American Express':
						$('.card-types img').addClass('greyscale');
						$('.card-types #amex').removeClass('greyscale');
						break;
					case 'Mastercard':
						$('.card-types img').addClass('greyscale');
						$('.card-types #mastercard').removeClass('greyscale');
						break;
					case 'Maestro':
						$('.card-types img').addClass('greyscale');
						$('.card-types #maestro').removeClass('greyscale');
						break;
				}
			});
			self._validatePayInput('#payForm #cc_exp',4,'validateExpiry','expiry date');
			self._validatePayInput('#payForm #cc_cvc',3,'validateCvc','card verification number');
		},
		_validatePayInput: function(selector,minlength,paymillFunction,name,callback){
			$(selector).on('keyup',function(){
				var $parent = $(this).parent();
				$parent.removeClass('error')
				var $help = $parent.find('.help-inline');
				$help.empty();
				
				var value = $(this).val();
				if(value.length >= minlength && !paymill[paymillFunction](value)){
					$help.text('Please check the '+name);
					$parent.addClass('error');
				}
				
				if(callback){
					callback(value);
				}
			});
		},
		_submitPayment: function(){
			$(".payment-errors").empty().hide();
		
			var expiry = $('#payForm #cc_exp').val();
			var month = expiry.split('/')[0];
			var year = expiry.split('/')[1];
			var params = {
		        amount_int: 299,
		        currency:'GBP',
		        number: $('#payForm #cc_number').val(),
		        exp_month: month,
		        exp_year: year,
		        cvc: $('#payForm #cc_cvc').val(),
		        cardholder: $('#payForm #cc_name').val()
		      };
		     
		    var hasErrors = false;  
		      
		    if (false == paymill.validateCardNumber(params.number)) {
				$(".payment-errors").text("Please check you card number");
				hasErrors = true;
			}
			if (false == paymill.validateExpiry(params.exp_month, params.exp_year)) {
				$(".payment-errors").text("Please check your expiry date");
				hasErrors = true;
			}
			
			if (params.name == '') {
				$(".payment-errors").text("Please check the name on the front of your card");
				hasErrors = true;
			}
			
			if(!hasErrors){
				paymill.createToken(params, new function(error,result){
					if (error) {
				    	$(".payment-errors").text(error.apierror).show();
				    }else{
						console.log(result.token);
					}
				});
			}else{
				$(".payment-errors").show();
			}
		},
		_showUser: function(userId){
			BakeOff.$loading.show();
			var self = this;
			ViewModel.userModel.clear();
			ViewModel.profileView(false);
			ViewModel.bakeView(false);
			ViewModel.feedView(false);
			ViewModel.recipeView(false);
			ViewModel.userView(true);
			ViewModel.postcardAddressView(false);
			
			$.ajax({
				type:"GET",
				url:self.baseUrl+'/user/'+userId+'/profile?key='+self.authToken,
				contentType: 'application/json',
				success:function(response){
					ViewModel.userModel.userId(response.data.user.id);
					ViewModel.userModel.name(response.data.user.firstName);
					ViewModel.userModel.photo(response.data.user.profilePhoto);
					ViewModel.userModel.noRecipes(response.data.noRecipes);
					ViewModel.userModel.noChallenges(response.data.noChallenges);
					ViewModel.userModel.noLikes(response.data.noLikes);
				
					$.each(response.data.bakes,function(key, bake){
						ViewModel.userModel.recipes.push(bake);
					});
				},
				error:function(){
					BakeOff._notify("Something went wrong loading the user");
				},
				complete:function(){
					BakeOff.$loading.hide();
				}
			});
		},
		_vote: function(bake){
			if(bake.hasVoted()){
				BakeOff._trackPage("/bake/"+bake.id+"/dupevote");
				BakeOff._notify("You have already voted for this bake");
				return;
			}
			var self = this;
			BakeOff._trackPage("/bake/"+bake.id+"/vote");
			$.ajax({
				type:"POST",
				data: JSON.stringify({}),
				url:self.baseUrl+'/bake/'+bake.id+'/vote?key='+self.authToken,
				contentType: 'application/json',
				success:function(response){
					if(response.meta.code==200 && response.data.like){
						bake.votes.push(self.userId);
					}
				},
				error:function(){
					self._notify('Something went wrong casting your vote.');	
				}
			});
		},
		_notify: function(message){
			if(navigator.mozNotification){
				var notification = navigator.mozNotification;
				var n = notification.createNotification(title, message);
				n.show();
			}
			
			humane.log(message,{timeout:5000, clickToClose:true});
		},
		_scrollTo: function(selector){
			$("html body").animate({ scrollTop: $(selector).offset().top-41 }, 1000);
		},
		_showOverlay: function(iconClass,text,bake){
			var $content = $('.overlay-dialog .dialog-content').hide();
			$content.find('.ca-icon i').attr('class',iconClass);
			$content.find('.ca-main').text(text);
			var $li = $content.find('li');
			$li.removeClass('active').hide();
			
			var $challengeBtn = $content.parent().find('button.btn-challenge');
			if(bake){
				$challengeBtn.show().unbind('click').click(function(){
					BakeOff._challenge(bake.id,bake.recipeTitle,bake.recipeId,bake.photoUrl);
					$('.wrap-outer , .close').click();
				});
			}else{
				$challengeBtn.hide();
			}
			
			//show the overlay
			$('body').addClass('overlaid');
			$content.show();
			$li.addClass('active').show();
			
			$('.overlay-dialog').click(function(e){
				e.preventDefault();
				return false;
			});
			
			$('.wrap-outer , .close').click(function(){
				$('body').removeClass('overlaid');
				$(this).unbind('click');
				return false;
			});
		},
		_trackEvent: function(category, action, label){
			try{
				_gaq.push(['_trackEvent', category, action, label]);
			}catch(e){}
		},
		_trackPage: function(page){
			try{
				_gaq.push(['_trackPageview', page]);
			}catch(e){}
		}
	};
})();

//3rd party libraries init code
Libs = (function(){ 
	return {
		init: function(){
		    ;(function (window, document, Slammy, undef) {
				Slammy.addRoutes({
				    '!recipe/:id/:userId': function (params) {
				    	if(typeof params.id != 'undefined'){
				    		BakeOff._showRecipe(params.id,params.userId);
				    	}
				    } , 
				    '!challenge/:id': function (params) {
				    	if(typeof params.id != 'undefined'){
				    		BakeOff._showChallenge(params.id);
				    	}
				    } ,  
				    '!user/:id': function (params) {
				    	if(typeof params.id != 'undefined'){
				    		BakeOff._showUser(params.id);
				    	}
				    }  
				});
				Slammy.noSuchRoute(function (route) {
				    //console.log("no route found");
				});	
				Slammy.run('/');
			})(window, document, Slammy);
			
			if(BakeOff.isMobile){
	    		window.addEventListener('load', function () {
					FastClick.attach(document.body);
				}, false);
			}
		    
		    setTimeout(function(){
		    	if(!ViewModel.loggedIn()){
		    		$('.why-facebook').show();
			    	$.ajax({
						type:"GET",
						url:BakeOff.baseUrl+'/bake/newBakes',
						contentType: 'application/json',
						success:function(response){
							if(response.meta.code==200 && response.data.bakes){
								response.data.bakes.reverse();
								$.each(response.data.bakes,function(key,bake){
									ViewModel.welcomeModel.bakes.push(bake);
								});
							}
						},
						error:function(){}
					});
		    	}
		    },4000);
		},
		loadFilepicker: function(callback){
			if(window.filepicker){
				if(callback){
					callback();
				}
				return;
			}
			$.getScript((window.location.protocol?"https:":"http:")+"//api.filepicker.io/v1/filepicker.js",function(){
				filepicker.setKey("AYbDEMhTTbytpmpGr0nklz");
				if(callback){
					callback();
				}
			});			
		},
		loadIntercom:function(){
			$.getScript('//static.intercomcdn.com/intercom.v1.js');
		}
	} 
} )();

/* LIBS */

;(function($){
    
    $.loadStyle = function(url) {
    	var style = document.createElement("link"),
    	$style = $(style);
    	$style.attr({
    		rel:'stylesheet',
    		type:'text/css',
    		href: url
    	});
    	
    	$("head").append($style);
    };

})(jQuery);

/* https://github.com/adobi/jquery-cross-domain-ajax */
(function($) {
	
	$.extend($.fn, {
    	crossDomain: function(options) {		
			options = $.extend({}, {
				url: '',
				format: 'xml',
				success: null,
				error: null
			}, options);
			
			return this.each(function() {
				
				var self = $(this);
				
				if($.trim(options.url)) {
					if(isExternal(options.url)) {
						
						var yql = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22"+
									encodeURIComponent(options.url)+"%22"+
									"&format="+options.format+
									"&callback=?";
						//console.log(yql);
						$.getJSON(yql, function(response) {
							if(!response.results[0]){
								if(options.error){
									options.error();
								}
								
								return;
							}
							self.html(filter(response.results[0]));
							if(options.success){
								options.success();
							}
						}).error(function(){
							if(options.error){
								options.error();
							}
						});
						
					}
					else {
						self.load(options.url);
					}
				}
			});
			
			var isExternal = function(url) {
				return /http:\/\/.*/.test(url);
			}
			
			var filter = function(data) {
				
			    data = data.replace(/<?\/body[^>]*>/g,'');
			    data = data.replace(/[\r|\n]+/g,'');
			    data = data.replace(/<--[\S\s]*?-->/g,'');
			    data = data.replace(/<noscript[^>]*>[\S\s]*?<\/noscript>/g,'');
			    data = data.replace(/<script[^>]*>[\S\s]*?<\/script>/g,'');
			    data = data.replace(/<script.*\/>/,'');
			    
			    return data;
				
			}
		}
	});
	
}) ($);

/*!
 * Bootstrap without jQuery v0.3.1
 * By Daniel Davis under MIT License
 * https://github.com/tagawa/bootstrap-without-jquery
 */

!function (name, context, definition) {
  if (typeof module != 'undefined' && module.exports) module.exports = definition()
  else if (typeof define == 'function' && define.amd) define(definition)
  else context[name] = definition()
  
  context[name].init();
}('bootstrapnojquery', this, function () {
	return {
		init : function(){
			var self = this;
			// querySelectorAll support for older IE
		    // Source: http://weblogs.asp.net/bleroy/archive/2009/08/31/queryselectorall-on-old-ie-versions-something-that-doesn-t-work.aspx
		    if (!document.querySelectorAll) {
		        document.querySelectorAll = function(selector) {
		            var style = document.styleSheets[0] || document.createStyleSheet();
		            style.addRule(selector, "foo:bar");
		            var all = document.all, resultSet = [];
		            for (var i = 0, l = all.length; i < l; i++) {
		                if (all[i].currentStyle.foo === "bar") {
		                    resultSet[resultSet.length] = all[i];
		                }
		            }
		            style.removeRule(0);
		            return resultSet;
		        };
		    }
		
			// Set event listeners for collapsible menus
		    var collapsibles = document.querySelectorAll('[data-toggle=collapse]');
		    for (var i = 0, len = collapsibles.length; i < len; i++) {
		        collapsibles[i].onclick = doCollapse;
		    }
		
		    // Set event listeners for dropdown menus
		    var dropdowns = document.querySelectorAll('[data-toggle=dropdown]');
		    for (var i = 0, dropdown, len = dropdowns.length; i < len; i++) {
		        dropdown = dropdowns[i];
		        self.initDropdown(dropdown);
		    }
		
		    // Set event listeners for alert boxes
		    var alerts = document.querySelectorAll('[data-dismiss=alert]');
		    for (var i = 0, len = alerts.length; i < len; i++) {
		        alerts[i].onclick = self.closeAlert;
		    }
		},
		initDropdown: function(dropdown){
			var self = this;
			dropdown.setAttribute('tabindex', '0'); // Fix to make onblur work in Chrome
	        dropdown.onclick = self.doDropdown;
		},
	    // Get the "hidden" height of a collapsed element
	    getHiddenHeight : function (el) {
	        var children = el.children;
	        var height = 0;
	        for (var i = 0, len = children.length, child; i < len; i++) {
	            child = children[i];
	            height += Math.max(child['clientHeight'], child['offsetHeight'], child['scrollHeight']);
	        }
	        return height;
	    },
	
	    // Collapse and expand the relevent element 
	    doCollapse : function (event) {
	        event = event || window.event;
	        var evTarget = event.currentTarget || event.srcElement;
	        var dataTarget = evTarget.getAttribute('data-target');
	        var target = document.querySelector(dataTarget);
	        var targetHeight = getHiddenHeight(target);
	        var className = (' ' + target.className + ' ');
	
	        if (className.indexOf(' ' + 'in' + ' ') > -1) {
	            // Hide the element
	            className = className.replace(' in ', ' ');
	            target.className = className;
	            target.style.height = '0';
	        } else {
	            // Show the element
	            target.className += ' in ';
	            target.style.height = targetHeight + 'px';
	        }
	        return false;
	    },
	
	    // Show a dropdown menu
	    doDropdown : function (event) {
	        event = event || window.event;
	        var evTarget = event.currentTarget || event.srcElement;
	        var target = evTarget.parentElement;
	        var className = (' ' + target.className + ' ');
	        
	        if (className.indexOf(' ' + 'open' + ' ') > -1) {
	            // Hide the menu
	            className = className.replace(' open ', ' ');
	            target.className = className;
	        } else {
	            // Show the menu
	            target.className += ' open ';
	        }
			
			//hack to allow clicking on anywhere to remove the dropdown
			setTimeout(function(){
				$('body').one('click',function(){
					$('.dropdown.open').each(function(){
						$(this).removeClass('open');
					});
				});
			},1000);
			
			
	        return false;
	    },
	    
	    // Close a dropdown menu
	    closeDropdown : function (event) {
	        event = event || window.event;
	        var evTarget = event.currentTarget || event.srcElement;
	        var target = evTarget.parentElement;
	        
	        target.className = (' ' + target.className + ' ').replace(' open ', ' ');
			
	        return false;
	    },
	
	    // Close an alert box by removing it from the DOM
	    closeAlert : function (event) {
	        event = event || window.event;
	        var evTarget = event.currentTarget || event.srcElement;
	        var alertBox = evTarget.parentElement;
	        
	        alertBox.parentElement.removeChild(alertBox);
	        return false;
	    }
	};
});

/**
 * @preserve FastClick: polyfill to remove click delays on browsers with touch UIs.
 *
 * @version 0.6.7
 * @codingstandard ftlabs-jsv2
 * @copyright The Financial Times Limited [All Rights Reserved]
 * @license MIT License (see LICENSE.txt)
 */
function FastClick(e){"use strict";var t,n=this;this.trackingClick=false;this.trackingClickStart=0;this.targetElement=null;this.touchStartX=0;this.touchStartY=0;this.lastTouchIdentifier=0;this.touchBoundary=10;this.layer=e;if(!e||!e.nodeType){throw new TypeError("Layer must be a document node")}this.onClick=function(){return FastClick.prototype.onClick.apply(n,arguments)};this.onMouse=function(){return FastClick.prototype.onMouse.apply(n,arguments)};this.onTouchStart=function(){return FastClick.prototype.onTouchStart.apply(n,arguments)};this.onTouchEnd=function(){return FastClick.prototype.onTouchEnd.apply(n,arguments)};this.onTouchCancel=function(){return FastClick.prototype.onTouchCancel.apply(n,arguments)};if(FastClick.notNeeded(e)){return}if(this.deviceIsAndroid){e.addEventListener("mouseover",this.onMouse,true);e.addEventListener("mousedown",this.onMouse,true);e.addEventListener("mouseup",this.onMouse,true)}e.addEventListener("click",this.onClick,true);e.addEventListener("touchstart",this.onTouchStart,false);e.addEventListener("touchend",this.onTouchEnd,false);e.addEventListener("touchcancel",this.onTouchCancel,false);if(!Event.prototype.stopImmediatePropagation){e.removeEventListener=function(t,n,r){var i=Node.prototype.removeEventListener;if(t==="click"){i.call(e,t,n.hijacked||n,r)}else{i.call(e,t,n,r)}};e.addEventListener=function(t,n,r){var i=Node.prototype.addEventListener;if(t==="click"){i.call(e,t,n.hijacked||(n.hijacked=function(e){if(!e.propagationStopped){n(e)}}),r)}else{i.call(e,t,n,r)}}}if(typeof e.onclick==="function"){t=e.onclick;e.addEventListener("click",function(e){t(e)},false);e.onclick=null}}FastClick.prototype.deviceIsAndroid=navigator.userAgent.indexOf("Android")>0;FastClick.prototype.deviceIsIOS=/iP(ad|hone|od)/.test(navigator.userAgent);FastClick.prototype.deviceIsIOS4=FastClick.prototype.deviceIsIOS&&/OS 4_\d(_\d)?/.test(navigator.userAgent);FastClick.prototype.deviceIsIOSWithBadTarget=FastClick.prototype.deviceIsIOS&&/OS ([6-9]|\d{2})_\d/.test(navigator.userAgent);FastClick.prototype.needsClick=function(e){"use strict";switch(e.nodeName.toLowerCase()){case"button":case"select":case"textarea":if(e.disabled){return true}break;case"input":if(this.deviceIsIOS&&e.type==="file"||e.disabled){return true}break;case"label":case"video":return true}return/\bneedsclick\b/.test(e.className)};FastClick.prototype.needsFocus=function(e){"use strict";switch(e.nodeName.toLowerCase()){case"textarea":case"select":return true;case"input":switch(e.type){case"button":case"checkbox":case"file":case"image":case"radio":case"submit":return false}return!e.disabled&&!e.readOnly;default:return/\bneedsfocus\b/.test(e.className)}};FastClick.prototype.sendClick=function(e,t){"use strict";var n,r;if(document.activeElement&&document.activeElement!==e){document.activeElement.blur()}r=t.changedTouches[0];n=document.createEvent("MouseEvents");n.initMouseEvent("click",true,true,window,1,r.screenX,r.screenY,r.clientX,r.clientY,false,false,false,false,0,null);n.forwardedTouchEvent=true;e.dispatchEvent(n)};FastClick.prototype.focus=function(e){"use strict";var t;if(this.deviceIsIOS&&e.setSelectionRange){t=e.value.length;e.setSelectionRange(t,t)}else{e.focus()}};FastClick.prototype.updateScrollParent=function(e){"use strict";var t,n;t=e.fastClickScrollParent;if(!t||!t.contains(e)){n=e;do{if(n.scrollHeight>n.offsetHeight){t=n;e.fastClickScrollParent=n;break}n=n.parentElement}while(n)}if(t){t.fastClickLastScrollTop=t.scrollTop}};FastClick.prototype.getTargetElementFromEventTarget=function(e){"use strict";if(e.nodeType===Node.TEXT_NODE){return e.parentNode}return e};FastClick.prototype.onTouchStart=function(e){"use strict";var t,n,r;if(e.targetTouches.length>1){return true}t=this.getTargetElementFromEventTarget(e.target);n=e.targetTouches[0];if(this.deviceIsIOS){r=window.getSelection();if(r.rangeCount&&!r.isCollapsed){return true}if(!this.deviceIsIOS4){if(n.identifier===this.lastTouchIdentifier){e.preventDefault();return false}this.lastTouchIdentifier=n.identifier;this.updateScrollParent(t)}}this.trackingClick=true;this.trackingClickStart=e.timeStamp;this.targetElement=t;this.touchStartX=n.pageX;this.touchStartY=n.pageY;if(e.timeStamp-this.lastClickTime<200){e.preventDefault()}return true};FastClick.prototype.touchHasMoved=function(e){"use strict";var t=e.changedTouches[0],n=this.touchBoundary;if(Math.abs(t.pageX-this.touchStartX)>n||Math.abs(t.pageY-this.touchStartY)>n){return true}return false};FastClick.prototype.findControl=function(e){"use strict";if(e.control!==undefined){return e.control}if(e.htmlFor){return document.getElementById(e.htmlFor)}return e.querySelector("button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea")};FastClick.prototype.onTouchEnd=function(e){"use strict";var t,n,r,i,s,o=this.targetElement;if(this.touchHasMoved(e)){this.trackingClick=false;this.targetElement=null}if(!this.trackingClick){return true}if(e.timeStamp-this.lastClickTime<200){this.cancelNextClick=true;return true}this.lastClickTime=e.timeStamp;n=this.trackingClickStart;this.trackingClick=false;this.trackingClickStart=0;if(this.deviceIsIOSWithBadTarget){s=e.changedTouches[0];o=document.elementFromPoint(s.pageX-window.pageXOffset,s.pageY-window.pageYOffset)}r=o.tagName.toLowerCase();if(r==="label"){t=this.findControl(o);if(t){this.focus(o);if(this.deviceIsAndroid){return false}o=t}}else if(this.needsFocus(o)){if(e.timeStamp-n>100||this.deviceIsIOS&&window.top!==window&&r==="input"){this.targetElement=null;return false}this.focus(o);if(!this.deviceIsIOS4||r!=="select"){this.targetElement=null;e.preventDefault()}return false}if(this.deviceIsIOS&&!this.deviceIsIOS4){i=o.fastClickScrollParent;if(i&&i.fastClickLastScrollTop!==i.scrollTop){return true}}if(!this.needsClick(o)){e.preventDefault();this.sendClick(o,e)}return false};FastClick.prototype.onTouchCancel=function(){"use strict";this.trackingClick=false;this.targetElement=null};FastClick.prototype.onMouse=function(e){"use strict";if(!this.targetElement){return true}if(e.forwardedTouchEvent){return true}if(!e.cancelable){return true}if(!this.needsClick(this.targetElement)||this.cancelNextClick){if(e.stopImmediatePropagation){e.stopImmediatePropagation()}else{e.propagationStopped=true}e.stopPropagation();e.preventDefault();return false}return true};FastClick.prototype.onClick=function(e){"use strict";var t;if(this.trackingClick){this.targetElement=null;this.trackingClick=false;return true}if(e.target.type==="submit"&&e.detail===0){return true}t=this.onMouse(e);if(!t){this.targetElement=null}return t};FastClick.prototype.destroy=function(){"use strict";var e=this.layer;if(this.deviceIsAndroid){e.removeEventListener("mouseover",this.onMouse,true);e.removeEventListener("mousedown",this.onMouse,true);e.removeEventListener("mouseup",this.onMouse,true)}e.removeEventListener("click",this.onClick,true);e.removeEventListener("touchstart",this.onTouchStart,false);e.removeEventListener("touchend",this.onTouchEnd,false);e.removeEventListener("touchcancel",this.onTouchCancel,false)};FastClick.notNeeded=function(e){"use strict";var t;if(typeof window.ontouchstart==="undefined"){return true}if(/Chrome\/[0-9]+/.test(navigator.userAgent)){if(FastClick.prototype.deviceIsAndroid){t=document.querySelector("meta[name=viewport]");if(t&&t.content.indexOf("user-scalable=no")!==-1){return true}}else{return true}}if(e.style.msTouchAction==="none"){return true}return false};FastClick.attach=function(e){"use strict";return new FastClick(e)};if(typeof define!=="undefined"&&define.amd){define(function(){"use strict";return FastClick})}else if(typeof module!=="undefined"&&module.exports){module.exports=FastClick.attach;module.exports.FastClick=FastClick}else{window.FastClick=FastClick}


/**
 * humane.js
 * Humanized Messages for Notifications
 * @author Marc Harter (@wavded)
 * @example
 *   humane.log('hello world');
 * See more usage examples at: http://wavded.github.com/humane-js/
 */
!function(t,e,i){"undefined"!=typeof module?module.exports=i(t,e):"function"==typeof define&&"object"==typeof define.amd?define(i):e[t]=i(t,e)}("humane",this,function(){var t=window,e=document,i={on:function(e,i,n){"addEventListener"in t?e.addEventListener(i,n,!1):e.attachEvent("on"+i,n)},off:function(e,i,n){"removeEventListener"in t?e.removeEventListener(i,n,!1):e.detachEvent("on"+i,n)},bind:function(t,e){return function(){t.apply(e,arguments)}},isArray:Array.isArray||function(t){return"[object Array]"===Object.prototype.toString.call(t)},config:function(t,e){return null!=t?t:e},transSupport:!1,useFilter:/msie [678]/i.test(navigator.userAgent),_checkTransition:function(){var t=e.createElement("div"),i={webkit:"webkit",Moz:"",O:"o",ms:"MS"};for(var n in i)n+"Transition"in t.style&&(this.vendorPrefix=i[n],this.transSupport=!0)}};i._checkTransition();var n=function(e){e||(e={}),this.queue=[],this.baseCls=e.baseCls||"humane",this.addnCls=e.addnCls||"",this.timeout="timeout"in e?e.timeout:2500,this.waitForMove=e.waitForMove||!1,this.clickToClose=e.clickToClose||!1,this.timeoutAfterMove=e.timeoutAfterMove||!1,this.container=e.container;try{this._setupEl()}catch(n){i.on(t,"load",i.bind(this._setupEl,this))}};return n.prototype={constructor:n,_setupEl:function(){var t=e.createElement("div");if(t.style.display="none",!this.container){if(!e.body)throw"document.body is null";this.container=e.body}this.container.appendChild(t),this.el=t,this.removeEvent=i.bind(function(){this.timeoutAfterMove?setTimeout(i.bind(this.remove,this),this.timeout):this.remove()},this),this.transEvent=i.bind(this._afterAnimation,this),this._run()},_afterTimeout:function(){i.config(this.currentMsg.waitForMove,this.waitForMove)?this.removeEventsSet||(i.on(e.body,"mousemove",this.removeEvent),i.on(e.body,"click",this.removeEvent),i.on(e.body,"keypress",this.removeEvent),i.on(e.body,"touchstart",this.removeEvent),this.removeEventsSet=!0):this.remove()},_run:function(){if(!this._animating&&this.queue.length&&this.el){this._animating=!0,this.currentTimer&&(clearTimeout(this.currentTimer),this.currentTimer=null);var t=this.queue.shift(),e=i.config(t.clickToClose,this.clickToClose);e&&(i.on(this.el,"click",this.removeEvent),i.on(this.el,"touchstart",this.removeEvent));var n=i.config(t.timeout,this.timeout);n>0&&(this.currentTimer=setTimeout(i.bind(this._afterTimeout,this),n)),i.isArray(t.html)&&(t.html="<ul><li>"+t.html.join("<li>")+"</ul>"),this.el.innerHTML=t.html,this.currentMsg=t,this.el.className=this.baseCls,i.transSupport?(this.el.style.display="block",setTimeout(i.bind(this._showMsg,this),50)):this._showMsg()}},_setOpacity:function(t){if(i.useFilter)try{this.el.filters.item("DXImageTransform.Microsoft.Alpha").Opacity=100*t}catch(e){}else this.el.style.opacity=String(t)},_showMsg:function(){var t=i.config(this.currentMsg.addnCls,this.addnCls);if(i.transSupport)this.el.className=this.baseCls+" "+t+" "+this.baseCls+"-animate";else{var e=0;this.el.className=this.baseCls+" "+t+" "+this.baseCls+"-js-animate",this._setOpacity(0),this.el.style.display="block";var n=this,s=setInterval(function(){1>e?(e+=.1,e>1&&(e=1),n._setOpacity(e)):clearInterval(s)},30)}},_hideMsg:function(){var t=i.config(this.currentMsg.addnCls,this.addnCls);if(i.transSupport)this.el.className=this.baseCls+" "+t,i.on(this.el,i.vendorPrefix?i.vendorPrefix+"TransitionEnd":"transitionend",this.transEvent);else var e=1,n=this,s=setInterval(function(){e>0?(e-=.1,0>e&&(e=0),n._setOpacity(e)):(n.el.className=n.baseCls+" "+t,clearInterval(s),n._afterAnimation())},30)},_afterAnimation:function(){i.transSupport&&i.off(this.el,i.vendorPrefix?i.vendorPrefix+"TransitionEnd":"transitionend",this.transEvent),this.currentMsg.cb&&this.currentMsg.cb(),this.el.style.display="none",this._animating=!1,this._run()},remove:function(t){var n="function"==typeof t?t:null;i.off(e.body,"mousemove",this.removeEvent),i.off(e.body,"click",this.removeEvent),i.off(e.body,"keypress",this.removeEvent),i.off(e.body,"touchstart",this.removeEvent),i.off(this.el,"click",this.removeEvent),i.off(this.el,"touchstart",this.removeEvent),this.removeEventsSet=!1,n&&this.currentMsg&&(this.currentMsg.cb=n),this._animating?this._hideMsg():n&&n()},log:function(t,e,i,n){var s={};if(n)for(var o in n)s[o]=n[o];if("function"==typeof e)i=e;else if(e)for(var o in e)s[o]=e[o];return s.html=t,i&&(s.cb=i),this.queue.push(s),this._run(),this},spawn:function(t){var e=this;return function(i,n,s){return e.log.call(e,i,n,s,t),e}},create:function(t){return new n(t)}},new n});

// moment.js
// version : 2.0.0
// author : Tim Wood
// license : MIT
// momentjs.com
(function(e){function O(e,t){return function(n){return j(e.call(this,n),t)}}function M(e){return function(t){return this.lang().ordinal(e.call(this,t))}}function _(){}function D(e){H(this,e)}function P(e){var t=this._data={},n=e.years||e.year||e.y||0,r=e.months||e.month||e.M||0,i=e.weeks||e.week||e.w||0,s=e.days||e.day||e.d||0,o=e.hours||e.hour||e.h||0,u=e.minutes||e.minute||e.m||0,a=e.seconds||e.second||e.s||0,f=e.milliseconds||e.millisecond||e.ms||0;this._milliseconds=f+a*1e3+u*6e4+o*36e5,this._days=s+i*7,this._months=r+n*12,t.milliseconds=f%1e3,a+=B(f/1e3),t.seconds=a%60,u+=B(a/60),t.minutes=u%60,o+=B(u/60),t.hours=o%24,s+=B(o/24),s+=i*7,t.days=s%30,r+=B(s/30),t.months=r%12,n+=B(r/12),t.years=n}function H(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n]);return e}function B(e){return e<0?Math.ceil(e):Math.floor(e)}function j(e,t){var n=e+"";while(n.length<t)n="0"+n;return n}function F(e,t,n){var r=t._milliseconds,i=t._days,s=t._months,o;r&&e._d.setTime(+e+r*n),i&&e.date(e.date()+i*n),s&&(o=e.date(),e.date(1).month(e.month()+s*n).date(Math.min(o,e.daysInMonth())))}function I(e){return Object.prototype.toString.call(e)==="[object Array]"}function q(e,t){var n=Math.min(e.length,t.length),r=Math.abs(e.length-t.length),i=0,s;for(s=0;s<n;s++)~~e[s]!==~~t[s]&&i++;return i+r}function R(e,t){return t.abbr=e,s[e]||(s[e]=new _),s[e].set(t),s[e]}function U(e){return e?(!s[e]&&o&&require("./lang/"+e),s[e]):t.fn._lang}function z(e){return e.match(/\[.*\]/)?e.replace(/^\[|\]$/g,""):e.replace(/\\/g,"")}function W(e){var t=e.match(a),n,r;for(n=0,r=t.length;n<r;n++)A[t[n]]?t[n]=A[t[n]]:t[n]=z(t[n]);return function(i){var s="";for(n=0;n<r;n++)s+=typeof t[n].call=="function"?t[n].call(i,e):t[n];return s}}function X(e,t){function r(t){return e.lang().longDateFormat(t)||t}var n=5;while(n--&&f.test(t))t=t.replace(f,r);return C[t]||(C[t]=W(t)),C[t](e)}function V(e){switch(e){case"DDDD":return p;case"YYYY":return d;case"YYYYY":return v;case"S":case"SS":case"SSS":case"DDD":return h;case"MMM":case"MMMM":case"dd":case"ddd":case"dddd":case"a":case"A":return m;case"X":return b;case"Z":case"ZZ":return g;case"T":return y;case"MM":case"DD":case"YY":case"HH":case"hh":case"mm":case"ss":case"M":case"D":case"d":case"H":case"h":case"m":case"s":return c;default:return new RegExp(e.replace("\\",""))}}function $(e,t,n){var r,i,s=n._a;switch(e){case"M":case"MM":s[1]=t==null?0:~~t-1;break;case"MMM":case"MMMM":r=U(n._l).monthsParse(t),r!=null?s[1]=r:n._isValid=!1;break;case"D":case"DD":case"DDD":case"DDDD":t!=null&&(s[2]=~~t);break;case"YY":s[0]=~~t+(~~t>68?1900:2e3);break;case"YYYY":case"YYYYY":s[0]=~~t;break;case"a":case"A":n._isPm=(t+"").toLowerCase()==="pm";break;case"H":case"HH":case"h":case"hh":s[3]=~~t;break;case"m":case"mm":s[4]=~~t;break;case"s":case"ss":s[5]=~~t;break;case"S":case"SS":case"SSS":s[6]=~~(("0."+t)*1e3);break;case"X":n._d=new Date(parseFloat(t)*1e3);break;case"Z":case"ZZ":n._useUTC=!0,r=(t+"").match(x),r&&r[1]&&(n._tzh=~~r[1]),r&&r[2]&&(n._tzm=~~r[2]),r&&r[0]==="+"&&(n._tzh=-n._tzh,n._tzm=-n._tzm)}t==null&&(n._isValid=!1)}function J(e){var t,n,r=[];if(e._d)return;for(t=0;t<7;t++)e._a[t]=r[t]=e._a[t]==null?t===2?1:0:e._a[t];r[3]+=e._tzh||0,r[4]+=e._tzm||0,n=new Date(0),e._useUTC?(n.setUTCFullYear(r[0],r[1],r[2]),n.setUTCHours(r[3],r[4],r[5],r[6])):(n.setFullYear(r[0],r[1],r[2]),n.setHours(r[3],r[4],r[5],r[6])),e._d=n}function K(e){var t=e._f.match(a),n=e._i,r,i;e._a=[];for(r=0;r<t.length;r++)i=(V(t[r]).exec(n)||[])[0],i&&(n=n.slice(n.indexOf(i)+i.length)),A[t[r]]&&$(t[r],i,e);e._isPm&&e._a[3]<12&&(e._a[3]+=12),e._isPm===!1&&e._a[3]===12&&(e._a[3]=0),J(e)}function Q(e){var t,n,r,i=99,s,o,u;while(e._f.length){t=H({},e),t._f=e._f.pop(),K(t),n=new D(t);if(n.isValid()){r=n;break}u=q(t._a,n.toArray()),u<i&&(i=u,r=n)}H(e,r)}function G(e){var t,n=e._i;if(w.exec(n)){e._f="YYYY-MM-DDT";for(t=0;t<4;t++)if(S[t][1].exec(n)){e._f+=S[t][0];break}g.exec(n)&&(e._f+=" Z"),K(e)}else e._d=new Date(n)}function Y(t){var n=t._i,r=u.exec(n);n===e?t._d=new Date:r?t._d=new Date(+r[1]):typeof n=="string"?G(t):I(n)?(t._a=n.slice(0),J(t)):t._d=n instanceof Date?new Date(+n):new Date(n)}function Z(e,t,n,r,i){return i.relativeTime(t||1,!!n,e,r)}function et(e,t,n){var i=r(Math.abs(e)/1e3),s=r(i/60),o=r(s/60),u=r(o/24),a=r(u/365),f=i<45&&["s",i]||s===1&&["m"]||s<45&&["mm",s]||o===1&&["h"]||o<22&&["hh",o]||u===1&&["d"]||u<=25&&["dd",u]||u<=45&&["M"]||u<345&&["MM",r(u/30)]||a===1&&["y"]||["yy",a];return f[2]=t,f[3]=e>0,f[4]=n,Z.apply({},f)}function tt(e,n,r){var i=r-n,s=r-e.day();return s>i&&(s-=7),s<i-7&&(s+=7),Math.ceil(t(e).add("d",s).dayOfYear()/7)}function nt(e){var n=e._i,r=e._f;return n===null||n===""?null:(typeof n=="string"&&(e._i=n=U().preparse(n)),t.isMoment(n)?(e=H({},n),e._d=new Date(+n._d)):r?I(r)?Q(e):K(e):Y(e),new D(e))}function rt(e,n){t.fn[e]=t.fn[e+"s"]=function(e){var t=this._isUTC?"UTC":"";return e!=null?(this._d["set"+t+n](e),this):this._d["get"+t+n]()}}function it(e){t.duration.fn[e]=function(){return this._data[e]}}function st(e,n){t.duration.fn["as"+e]=function(){return+this/n}}var t,n="2.0.0",r=Math.round,i,s={},o=typeof module!="undefined"&&module.exports,u=/^\/?Date\((\-?\d+)/i,a=/(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|YYYYY|YYYY|YY|a|A|hh?|HH?|mm?|ss?|SS?S?|X|zz?|ZZ?|.)/g,f=/(\[[^\[]*\])|(\\)?(LT|LL?L?L?|l{1,4})/g,l=/([0-9a-zA-Z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)/gi,c=/\d\d?/,h=/\d{1,3}/,p=/\d{3}/,d=/\d{1,4}/,v=/[+\-]?\d{1,6}/,m=/[0-9]*[a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF]+\s*?[\u0600-\u06FF]+/i,g=/Z|[\+\-]\d\d:?\d\d/i,y=/T/i,b=/[\+\-]?\d+(\.\d{1,3})?/,w=/^\s*\d{4}-\d\d-\d\d((T| )(\d\d(:\d\d(:\d\d(\.\d\d?\d?)?)?)?)?([\+\-]\d\d:?\d\d)?)?/,E="YYYY-MM-DDTHH:mm:ssZ",S=[["HH:mm:ss.S",/(T| )\d\d:\d\d:\d\d\.\d{1,3}/],["HH:mm:ss",/(T| )\d\d:\d\d:\d\d/],["HH:mm",/(T| )\d\d:\d\d/],["HH",/(T| )\d\d/]],x=/([\+\-]|\d\d)/gi,T="Month|Date|Hours|Minutes|Seconds|Milliseconds".split("|"),N={Milliseconds:1,Seconds:1e3,Minutes:6e4,Hours:36e5,Days:864e5,Months:2592e6,Years:31536e6},C={},k="DDD w W M D d".split(" "),L="M D H h m s w W".split(" "),A={M:function(){return this.month()+1},MMM:function(e){return this.lang().monthsShort(this,e)},MMMM:function(e){return this.lang().months(this,e)},D:function(){return this.date()},DDD:function(){return this.dayOfYear()},d:function(){return this.day()},dd:function(e){return this.lang().weekdaysMin(this,e)},ddd:function(e){return this.lang().weekdaysShort(this,e)},dddd:function(e){return this.lang().weekdays(this,e)},w:function(){return this.week()},W:function(){return this.isoWeek()},YY:function(){return j(this.year()%100,2)},YYYY:function(){return j(this.year(),4)},YYYYY:function(){return j(this.year(),5)},a:function(){return this.lang().meridiem(this.hours(),this.minutes(),!0)},A:function(){return this.lang().meridiem(this.hours(),this.minutes(),!1)},H:function(){return this.hours()},h:function(){return this.hours()%12||12},m:function(){return this.minutes()},s:function(){return this.seconds()},S:function(){return~~(this.milliseconds()/100)},SS:function(){return j(~~(this.milliseconds()/10),2)},SSS:function(){return j(this.milliseconds(),3)},Z:function(){var e=-this.zone(),t="+";return e<0&&(e=-e,t="-"),t+j(~~(e/60),2)+":"+j(~~e%60,2)},ZZ:function(){var e=-this.zone(),t="+";return e<0&&(e=-e,t="-"),t+j(~~(10*e/6),4)},X:function(){return this.unix()}};while(k.length)i=k.pop(),A[i+"o"]=M(A[i]);while(L.length)i=L.pop(),A[i+i]=O(A[i],2);A.DDDD=O(A.DDD,3),_.prototype={set:function(e){var t,n;for(n in e)t=e[n],typeof t=="function"?this[n]=t:this["_"+n]=t},_months:"January_February_March_April_May_June_July_August_September_October_November_December".split("_"),months:function(e){return this._months[e.month()]},_monthsShort:"Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),monthsShort:function(e){return this._monthsShort[e.month()]},monthsParse:function(e){var n,r,i,s;this._monthsParse||(this._monthsParse=[]);for(n=0;n<12;n++){this._monthsParse[n]||(r=t([2e3,n]),i="^"+this.months(r,"")+"|^"+this.monthsShort(r,""),this._monthsParse[n]=new RegExp(i.replace(".",""),"i"));if(this._monthsParse[n].test(e))return n}},_weekdays:"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),weekdays:function(e){return this._weekdays[e.day()]},_weekdaysShort:"Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),weekdaysShort:function(e){return this._weekdaysShort[e.day()]},_weekdaysMin:"Su_Mo_Tu_We_Th_Fr_Sa".split("_"),weekdaysMin:function(e){return this._weekdaysMin[e.day()]},_longDateFormat:{LT:"h:mm A",L:"MM/DD/YYYY",LL:"MMMM D YYYY",LLL:"MMMM D YYYY LT",LLLL:"dddd, MMMM D YYYY LT"},longDateFormat:function(e){var t=this._longDateFormat[e];return!t&&this._longDateFormat[e.toUpperCase()]&&(t=this._longDateFormat[e.toUpperCase()].replace(/MMMM|MM|DD|dddd/g,function(e){return e.slice(1)}),this._longDateFormat[e]=t),t},meridiem:function(e,t,n){return e>11?n?"pm":"PM":n?"am":"AM"},_calendar:{sameDay:"[Today at] LT",nextDay:"[Tomorrow at] LT",nextWeek:"dddd [at] LT",lastDay:"[Yesterday at] LT",lastWeek:"[last] dddd [at] LT",sameElse:"L"},calendar:function(e,t){var n=this._calendar[e];return typeof n=="function"?n.apply(t):n},_relativeTime:{future:"in %s",past:"%s ago",s:"a few seconds",m:"a minute",mm:"%d minutes",h:"an hour",hh:"%d hours",d:"a day",dd:"%d days",M:"a month",MM:"%d months",y:"a year",yy:"%d years"},relativeTime:function(e,t,n,r){var i=this._relativeTime[n];return typeof i=="function"?i(e,t,n,r):i.replace(/%d/i,e)},pastFuture:function(e,t){var n=this._relativeTime[e>0?"future":"past"];return typeof n=="function"?n(t):n.replace(/%s/i,t)},ordinal:function(e){return this._ordinal.replace("%d",e)},_ordinal:"%d",preparse:function(e){return e},postformat:function(e){return e},week:function(e){return tt(e,this._week.dow,this._week.doy)},_week:{dow:0,doy:6}},t=function(e,t,n){return nt({_i:e,_f:t,_l:n,_isUTC:!1})},t.utc=function(e,t,n){return nt({_useUTC:!0,_isUTC:!0,_l:n,_i:e,_f:t})},t.unix=function(e){return t(e*1e3)},t.duration=function(e,n){var r=t.isDuration(e),i=typeof e=="number",s=r?e._data:i?{}:e,o;return i&&(n?s[n]=e:s.milliseconds=e),o=new P(s),r&&e.hasOwnProperty("_lang")&&(o._lang=e._lang),o},t.version=n,t.defaultFormat=E,t.lang=function(e,n){var r;if(!e)return t.fn._lang._abbr;n?R(e,n):s[e]||U(e),t.duration.fn._lang=t.fn._lang=U(e)},t.langData=function(e){return e&&e._lang&&e._lang._abbr&&(e=e._lang._abbr),U(e)},t.isMoment=function(e){return e instanceof D},t.isDuration=function(e){return e instanceof P},t.fn=D.prototype={clone:function(){return t(this)},valueOf:function(){return+this._d},unix:function(){return Math.floor(+this._d/1e3)},toString:function(){return this.format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ")},toDate:function(){return this._d},toJSON:function(){return t.utc(this).format("YYYY-MM-DD[T]HH:mm:ss.SSS[Z]")},toArray:function(){var e=this;return[e.year(),e.month(),e.date(),e.hours(),e.minutes(),e.seconds(),e.milliseconds()]},isValid:function(){return this._isValid==null&&(this._a?this._isValid=!q(this._a,(this._isUTC?t.utc(this._a):t(this._a)).toArray()):this._isValid=!isNaN(this._d.getTime())),!!this._isValid},utc:function(){return this._isUTC=!0,this},local:function(){return this._isUTC=!1,this},format:function(e){var n=X(this,e||t.defaultFormat);return this.lang().postformat(n)},add:function(e,n){var r;return typeof e=="string"?r=t.duration(+n,e):r=t.duration(e,n),F(this,r,1),this},subtract:function(e,n){var r;return typeof e=="string"?r=t.duration(+n,e):r=t.duration(e,n),F(this,r,-1),this},diff:function(e,n,r){var i=this._isUTC?t(e).utc():t(e).local(),s=(this.zone()-i.zone())*6e4,o,u;return n&&(n=n.replace(/s$/,"")),n==="year"||n==="month"?(o=(this.daysInMonth()+i.daysInMonth())*432e5,u=(this.year()-i.year())*12+(this.month()-i.month()),u+=(this-t(this).startOf("month")-(i-t(i).startOf("month")))/o,n==="year"&&(u/=12)):(o=this-i-s,u=n==="second"?o/1e3:n==="minute"?o/6e4:n==="hour"?o/36e5:n==="day"?o/864e5:n==="week"?o/6048e5:o),r?u:B(u)},from:function(e,n){return t.duration(this.diff(e)).lang(this.lang()._abbr).humanize(!n)},fromNow:function(e){return this.from(t(),e)},calendar:function(){var e=this.diff(t().startOf("day"),"days",!0),n=e<-6?"sameElse":e<-1?"lastWeek":e<0?"lastDay":e<1?"sameDay":e<2?"nextDay":e<7?"nextWeek":"sameElse";return this.format(this.lang().calendar(n,this))},isLeapYear:function(){var e=this.year();return e%4===0&&e%100!==0||e%400===0},isDST:function(){return this.zone()<t([this.year()]).zone()||this.zone()<t([this.year(),5]).zone()},day:function(e){var t=this._isUTC?this._d.getUTCDay():this._d.getDay();return e==null?t:this.add({d:e-t})},startOf:function(e){e=e.replace(/s$/,"");switch(e){case"year":this.month(0);case"month":this.date(1);case"week":case"day":this.hours(0);case"hour":this.minutes(0);case"minute":this.seconds(0);case"second":this.milliseconds(0)}return e==="week"&&this.day(0),this},endOf:function(e){return this.startOf(e).add(e.replace(/s?$/,"s"),1).subtract("ms",1)},isAfter:function(e,n){return n=typeof n!="undefined"?n:"millisecond",+this.clone().startOf(n)>+t(e).startOf(n)},isBefore:function(e,n){return n=typeof n!="undefined"?n:"millisecond",+this.clone().startOf(n)<+t(e).startOf(n)},isSame:function(e,n){return n=typeof n!="undefined"?n:"millisecond",+this.clone().startOf(n)===+t(e).startOf(n)},zone:function(){return this._isUTC?0:this._d.getTimezoneOffset()},daysInMonth:function(){return t.utc([this.year(),this.month()+1,0]).date()},dayOfYear:function(e){var n=r((t(this).startOf("day")-t(this).startOf("year"))/864e5)+1;return e==null?n:this.add("d",e-n)},isoWeek:function(e){var t=tt(this,1,4);return e==null?t:this.add("d",(e-t)*7)},week:function(e){var t=this.lang().week(this);return e==null?t:this.add("d",(e-t)*7)},lang:function(t){return t===e?this._lang:(this._lang=U(t),this)}};for(i=0;i<T.length;i++)rt(T[i].toLowerCase().replace(/s$/,""),T[i]);rt("year","FullYear"),t.fn.days=t.fn.day,t.fn.weeks=t.fn.week,t.fn.isoWeeks=t.fn.isoWeek,t.duration.fn=P.prototype={weeks:function(){return B(this.days()/7)},valueOf:function(){return this._milliseconds+this._days*864e5+this._months*2592e6},humanize:function(e){var t=+this,n=et(t,!e,this.lang());return e&&(n=this.lang().pastFuture(t,n)),this.lang().postformat(n)},lang:t.fn.lang};for(i in N)N.hasOwnProperty(i)&&(st(i,N[i]),it(i.toLowerCase()));st("Weeks",6048e5),t.lang("en",{ordinal:function(e){var t=e%10,n=~~(e%100/10)===1?"th":t===1?"st":t===2?"nd":t===3?"rd":"th";return e+n}}),o&&(module.exports=t),typeof ender=="undefined"&&(this.moment=t),typeof define=="function"&&define.amd&&define("moment",[],function(){return t})}).call(this);

/**
* Slammy 1.0
*
* An extremely lightweight and easy hashbang
* route handler in standard JavaScript - completly
* without dependencies.
*
* @author Björn Wikström <bjorn@welcom.se>
* @license LGPL v3 <http://www.gnu.org/licenses/lgpl.html>
* @version 1.0
* @copyright Welcom Web i Göteborg AB 2013
*/
(function(c,e,j){typeof c.Slammy===typeof j&&(e=function(){var f=[],h=!1,e=function(){},i=function(a){for(var b=!1,g=0;g<f.length;g++)if(f[g].route===a){b=!0;f[g].callback.call(c.Slammy,{});break}else{var e=f[g].route.substr(1).match(/\:([a-z0-9]+)/ig),d=f[g].route.replace(/\/\:([a-z0-9]+)/ig,"");if(0===a.indexOf(d)){b=a.substr(a.indexOf(d)+d.length+1).split("/");a={};for(d=0;d<e.length;d++)b[d]&&(a[e[d].substr(1)]=b[d]);b=!0;f[g].callback.call(c.Slammy,a);break}}b||c.Slammy.noSuchRoute()};setInterval(function(){var a=
c.location.hash.substr(1);a!==h&&i(a);h=a},50);return{addRoute:function(a,b){f.push({route:a,callback:b});return this},addRoutes:function(a){if("object"!==typeof a)return!1;for(var b in a)a.hasOwnProperty(b)&&"function"===typeof a[b]&&this.addRoute(b,a[b]);return this},noSuchRoute:function(a){"function"===typeof a?e=a:e.call(this,c.location.hash);return this},run:function(a){var b=h=c.location.hash.substr(1);b&&""!==b?i(b):c.location.hash="#"+a}}}(),c.Slammy=e)})(window,document);

function ButtonLoad(e){this.button=e;this.original=e.innerHTML;this.loading=false}ButtonLoad.prototype.start=function(){if(this.loading)return;this.disable();this.loading=true;var e=this;this.button.style.width=this.button.clientWidth+"px";this.button.innerHTML="";(function t(){var n=e.button.innerHTML;e.button.innerHTML=e.button.getAttribute("data-loading-text");if(e.loading){window.setTimeout(t,400)}else{e.button.innerHTML=e.original;e.button.style.width="inherit";e.enable()}})()};ButtonLoad.prototype.end=function(){this.loading=false};ButtonLoad.prototype.isLoading=function(){return this.loading};ButtonLoad.prototype.enable=function(){this.button.removeAttribute("disabled")};ButtonLoad.prototype.disable=function(){this.button.setAttribute("disabled","disabled")}