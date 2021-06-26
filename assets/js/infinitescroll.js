/**
 * Infinite Scroll
 */

(function(window, document) {
    // next link element
    var nextElement = document.querySelector('link[rel=next]');
    if (!nextElement) return;

    // post feed element
    var feedElement = document.querySelector('.infinite-scroll');
    if (!feedElement) return;

    var buffer = 300;

    var ticking = false;
    var loading = false;

    var lastScrollY = window.scrollY;
    var lastWindowHeight = window.innerHeight;
    var lastDocumentHeight = document.documentElement.scrollHeight;

    function alignPostCards() {
      var posts = [];
      $('.post-card').each(function() {
        if ($(this).hasClass('with-image') && !$(this).hasClass('featured')) {
          posts.push($(this).attr('id'));
        }
      });

      $.each(posts, function(index, post) {
        if (index % 2) {
          $('#'+post).addClass('align-left');
        } else {
          $('#'+post).addClass('align-right');
        }
      });
    }

    function onPageLoad() {
        if (this.status === 404) {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onResize);
            return;
        }

        // append contents
        var postElements = this.response.querySelectorAll('.post-card');
        postElements.forEach(function (item) {
            // feedElement.appendChild(item);
            $(item).hide().appendTo(feedElement);

            alignPostCards();

            $(item).fadeIn(800);
        });

        // set next link
        var resNextElement = this.response.querySelector('link[rel=next]');
        if (resNextElement) {
            nextElement.href = resNextElement.href;
        } else {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onResize);
        }

        // sync status
        lastDocumentHeight = document.documentElement.scrollHeight;
        ticking = false;
        loading = false;
    }

    function onUpdate() {
        // return if already loading
        if (loading) return;

        // return if not scroll to the bottom
        if (lastScrollY + lastWindowHeight <= lastDocumentHeight - buffer) {
            ticking = false;
            return;
        }

        loading = true;

        var xhr = new window.XMLHttpRequest();
        xhr.responseType = 'document';

        xhr.addEventListener('load', onPageLoad);

        xhr.open('GET', nextElement.href);
        xhr.send(null);
    }

    function requestTick() {
        ticking || window.requestAnimationFrame(onUpdate);
        ticking = true;
    }

    function onScroll() {
        lastScrollY = window.scrollY;
        requestTick();
    }

    function onResize() {
        lastWindowHeight = window.innerHeight;
        lastDocumentHeight = document.documentElement.scrollHeight;
        requestTick();
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    requestTick();
})(window, document);
