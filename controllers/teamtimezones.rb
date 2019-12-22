class ::DiscourseTeamTimezones::TeamtimezonesController < ::ApplicationController
  
  def index

    @results = []

    if current_user
      @group = Group.find_by_name(SiteSetting.team_timezones_group)
      @group_user_ids = @group.users.pluck("id")
      @results = User.joins("LEFT JOIN user_options ON user_options.user_id = users.id").where(id: @group_user_ids)
    end

    render_json_dump serialize_data(@results, ::DiscourseTeamTimezones::TeamTimezonesSerializer)
    
  end
end