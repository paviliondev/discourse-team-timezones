# name: discourse-team-timezones
# about: a dashboard is placed at the top of specified category topic lists to show waking hours of specificied group, e.g. staff
# version: 0.1
# authors: Robert Barrow
# url: https://github.com/paviliondev/discourse-team-timezones

register_asset 'stylesheets/common.scss'

enabled_site_setting :team_timezones_enabled

after_initialize do
  require_dependency 'application_controller'
  module ::DiscourseTeamTimezones
    class Engine < ::Rails::Engine
      engine_name 'discourse_teamtimezones'
      isolate_namespace DiscourseTeamTimezones
    end
  end

  Discourse::Application.routes.append do
    mount ::DiscourseTeamTimezones::Engine, at: '/'
  end

  DiscourseTeamTimezones::Engine.routes.draw do
    get '/teamtimezones' => 'teamtimezones#index'
  end

  load File.expand_path('../serializers/teamtimezones.rb', __FILE__)
  load File.expand_path('../controllers/teamtimezones.rb', __FILE__)
end