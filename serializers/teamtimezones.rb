class ::DiscourseTeamTimezones::TeamTimezonesSerializer < ApplicationSerializer
  attributes :id, :username, :username_lower, :name, :avatar_template, :timezone
  def timezone
    {timezone: self.object.user_option.timezone}
  end
end