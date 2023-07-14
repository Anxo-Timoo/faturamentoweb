/* v1 by gr33k01 */

var contentCollapse = {

    config: {
        fireSelector: '[data-toggle]',
        contentSelector: '.content',
        openClass: '.open',
        animate: true,
        duration: 300,
        easing: 'swing'
    },

    init: function(config) {

        $.extend(contentCollapse.config, config);

        $(contentCollapse.config.fireSelector).on('click', function(e) {

            var $activeTarget = $(this).parent();

            if ($activeTarget.hasClass(contentCollapse.config.openClass)) {
                contentCollapse.close($activeTarget);
                return;
            }

            contentCollapse.open($activeTarget);
        });
    },

    open: function($openSelector) {

        if(contentCollapse.config.animate){

            var $content = $openSelector.children(contentCollapse.config.contentSelector);
                
            $content.slideDown({
                'duration': contentCollapse.config.duration,
                'easing': contentCollapse.config.easing
            });
            $openSelector.addClass(contentCollapse.config.openClass);  

            return;
        }
        
        $openSelector.toggleClass('open');    
    },

    close: function($closeSelector) {

        if(contentCollapse.config.animate){

            var $content = $closeSelector.children(contentCollapse.config.contentSelector);

            $content.slideUp({
                'duration': contentCollapse.config.duration,
                'easing': contentCollapse.config.easing
            });
            $closeSelector.removeClass(contentCollapse.config.openClass);

            return;
        }
        
       $closeSelector.toggleClass('open');    
    }
}