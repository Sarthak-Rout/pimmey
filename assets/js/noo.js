/*!
 * Noo
 * Project Website: http://noo.pimmey.com
 * @version 1.0
 * @author Yegor Borisenco <pimmey@pimmey.com>
 */

'use strict';

var App = {};

App = {
    /*
    * Injecting the data from config.js
    * */
    CONFIG: CONFIG === 'undefined' ? console.error('Missing config file') : CONFIG,

    /*
    * Global variables used throughout the app
    * */
    GLOBAL: {
        activeToasts: 0,
        progress: $('.pace')
    },

    /*
    * A function that is responsible for window.onload
    * */
    onLoad: function onLoad () {
        window.onload = function () {
            // TODO: do something on load
        };
    },

    /*
     * Initing side nav for medium and smaller devices
     * */
    initSideNav: function sinitSideNav () {
        $('#sidenav-toggle').sideNav({
            closeOnClick: true
        });
    },

    /*
     * Initialising slider
     * http://materializecss.com/media.html#slider
     * */
    initSlider: function initSlider () {
        $('.slider').slider({
            full_width: true,
            height: window.innerWidth < 601 ? 350 : 720
        });
    },

    /*
     * Initialising scroll spy to detect current section
     * Check it out here: http://materializecss.com/scrollspy.html
     * */
    initScrollSpy: function initScrollSpy () {
        $('.scrollspy').scrollSpy({
            scrollOffset: 50
        });
    },

    /*
     Contact form handling
     @param String suffix helps differentiate between human and classic form modes
     Constricted to human and classic
     */
    initContactForm: function initContactForm () {
        var $name = $('#name');
        var $email = $('#email');
        var $message = $('#message');
        var $sendButton = $('#send-message');
        var initialMessage = $message.html();

        $sendButton.on('click', function (e) {
            e.preventDefault();
            App._sendMessage($name, $email, $message, initialMessage, $sendButton);
        });
    },

    /*
     A private function that sends the message, once everything is cool
     @param Obj $name the object that contains name value
     Obj $email the object that contains contact value
     Obj $message the object that contains message value
     String initialMessage initial message value
     Obj $sendButton the button that submits the form
     */
    _sendMessage: function _sendMessage ($name, $email, $message, initialMessage, $sendButton) {
        // Creating the conditions of the form's validity
        var isNameValid = App._verifyField($name, App.CONFIG.toastMessages.nameMissing);
        var isEmailValid = App._verifyField($email, App.CONFIG.toastMessages.contactMissing);
        var isMessageValid = App._verifyField($message, App.CONFIG.toastMessages.messageMissing, initialMessage);

        if (isNameValid && isEmailValid && isMessageValid) {
            App.GLOBAL.progress.show();

            // Disabling the button while we're waiting for the response
            $sendButton.attr('disabled', true);
            $.ajax({
                url: '/mailer/mailer.php',
                type: 'POST',
                data: {
                    name: $name.html() || $name.val(),
                    email: $email.html() || $email.val(),
                    message: $message.html() || $message.val()
                }
            }).done(function (res) {
                // res should return 1, if PHPMailer has done its job right
                if (res == true) {
                    Materialize.toast(App.CONFIG.toastMessages.messageSent, App.CONFIG.toastSpeed, 'success');

                    // Resetting the form
                    $name.html('') && $name.val('');
                    $email.html('') && $email.val('');
                    $message.html(initialMessage) && $message.val(initialMessage);

                    // Removing active class from label
                    $name.next().removeClass('active');
                    $email.next().removeClass('active');
                    $message.next().removeClass('active');
                } else {
                    Materialize.toast(App.CONFIG.toastMessages.somethingWrong + res, App.CONFIG.toastSpeed, 'error');
                }
            }).error(function (error) {
                console.error(error);
                Materialize.toast(App.CONFIG.toastMessages.somethingWrong + error, App.CONFIG.toastSpeed, 'error');
            }).complete(function () {
                App.GLOBAL.progress.hide();

                // Re-enabling the button on request complete
                $sendButton.attr('disabled', false);
            });
        }
    },

    /*
     A private function that handles field verifying
     @param Obj $field the object that contains selected field
     String errorMessage error message relevant to the selected field
     String initialMessage initial message value
     */
    _verifyField: function _verifyField ($field, errorMessage, initialMessage) {
        var fieldValue = $field.html() || $field.val();
        var isFieldInvalid;
        var isFieldLengthInvalid = fieldValue.length === 0;

        if (initialMessage !== 'undefined') {
            isFieldInvalid = isFieldLengthInvalid || (fieldValue === initialMessage);
        } else {
            isFieldInvalid = isFieldLengthInvalid;
        }

        if ($field.attr('type') === 'email' && ! /.+\@.+\..+/.test(fieldValue)) {
            Materialize.toast(App.CONFIG.toastMessages.enterValidEmail, App.CONFIG.toastSpeed, 'error', function () {
                App.GLOBAL.activeToasts--;
            });
            App.GLOBAL.activeToasts++;
            return false;
        }

        if (isFieldInvalid) {
            Materialize.toast(errorMessage, App.CONFIG.toastSpeed, 'error', function () {
                App.GLOBAL.activeToasts--;
            });
            App.GLOBAL.activeToasts++;
            return false;
        } else {
            return true;
        }
    },

    initRellax: function initRellax () {
        if ($('body').hasClass('rellax-on'))
        var rellax = new Rellax('.rellax', {
            center: true
        });
    },

    /*
     * Adding .animate class to services section on scroll
     * */
    initAnimateServiceIcons: function initAnimateServiceIcons () {
        var $servicesSection = $('.expertise');

        if ($servicesSection.length) {
            var servicesSectionOffset = $servicesSection.offset().top;
            var windowOffset;
            $(document).on('scroll ready', function () {
                windowOffset = $(window).scrollTop() + 250;
                if (windowOffset > servicesSectionOffset) {
                    $servicesSection.addClass('animate');
                }
            });
        }
    },

    /*
     * Handling modals behaviour
     * http://materializecss.com/modals.html
     * */
    initModal: function initModal () {
        if (window.location.hash.length > 0 && window.location.hash !== '#!') {
            $(window.location.hash).openModal({
                complete: function () {
                    history.replaceState('', document.title, window.location.pathname);
                }
            });
        }

        $('.modal-trigger').leanModal({
            opacity: .5,
            ready: function () {

            },
            complete: function () {
                history.replaceState('', document.title, window.location.pathname);
            }
        }).on('click', function () {
            var href = $(this).attr('href');
            setTimeout(function () {
                window.location.hash = href;
            }, 400);
        });
    },

    /*
     * A function that handles modal navigation
     * */
    initModalNav: function initModalNav () {
        var $links = $('.modal-nav');

        $links.on('click', function (e) {
            e.preventDefault();

            var $this = $(this);
            var current = window.location.hash;
            var next = $this.data('next-modal');
            var prev = $this.data('previous-modal');

            $(current).closeModal();

            if (typeof prev !== 'undefined') {
                $('#' + prev).openModal({
                    ready: function () {
                        $('.modal').scrollTop(0);
                        window.location.hash = prev;
                    },
                    complete: function () {
                        history.replaceState('', document.title, window.location.pathname);
                    }
                });
            }

            if (typeof next !== 'undefined') {
                $('#' + next).openModal({
                    ready: function () {
                        $('.modal').scrollTop(0);
                        window.location.hash = next;
                    },
                    complete: function () {
                        history.replaceState('', document.title, window.location.pathname);
                    }
                });
            }
        });
    },

    /*
    * Function that fades away the slogan elements on scroll
    * */
    initSloganFade: function initSloganFade () {
        var $slogan = $('.slogan');

        $(document).on('scroll', function () {
            $slogan.css('opacity', 1 - (window.scrollY / 500));
        });
    }
};

$(document).on('ready', function () {
    App.initSideNav();
    App.initScrollSpy();
    App.initSlider();
    App.initRellax();
    App.initAnimateServiceIcons();
    App.initModal();
    App.initModalNav();
    App.initSloganFade();
    App.initContactForm();
});
