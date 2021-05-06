import { createWidget } from "discourse/widgets/widget";
import { h } from "virtual-dom";
import { htmlSafe } from "@ember/template";
import { iconNode } from "discourse-common/lib/icon-library";
import { userPath } from "discourse/lib/url";
import { ajax } from "discourse/lib/ajax";

export default createWidget("team-timezone-vis", {
  tagName: "div.team-timezone-vis",
  buildKey: () => "team-timezone-vis",

  currentHour: () => {
    const d = new Date();
    return d.getHours();
  },

  process(people) {
    if (typeof people === "undefined") {
      return {};
    }

    const n = this.currentHour();

    let times_score = (a, i) => {
      return Math.pow(Math.sin((Math.PI / 24) * (i + a)), 4);
    };

    people.forEach((a) => {
      let timezone = a.timezone.timezone;
      a.offset = Math.round(moment.tz(timezone)._offset / 60);
    });

    people.sort((a, b) => a.username_lower.localeCompare(b.username_lower));

    people.sort((a, b) =>
      times_score(a.offset, n) < times_score(b.offset, n) ? 1 : -1
    );

    return people;
  },

  row: (person, self) => {
    const { siteSettings } = self;
    let times_score = (a, i) => {
      const periodic_time = a + i;
      const local_time =
        periodic_time >= 0
          ? periodic_time <= 23
            ? periodic_time
            : periodic_time - 24
          : periodic_time + 24;
      return siteSettings.team_timezones_mode == "zones"
        ? local_time >=
          siteSettings.team_timezones_evening_start
          ? 0.5
          : local_time <
            siteSettings.team_timezones_morning_start
          ? 0
          : 1
        : Math.abs(
            Math.pow(
              Math.sin(
                (Math.PI / 24) *
                  (local_time -
                    siteSettings
                      .team_timezones_availability_origin_offset)
              ),
              siteSettings
                .team_timezones_availability_curve_power_function
            )
          );
    };

    const d = new Date();
    const n = d.getUTCHours();

    let rgbToHex = (r, g, b) => {
      return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    };

    let hexToRgb = (hex) => {
      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16),
          ]
        : null;
    };

    let colourGradientor = (p, rgb_beginning, rgb_end) => {
      var w = p * 2 - 1;
      var w1 = (w + 1) / 2.0;
      var w2 = 1 - w1;
      var rgb = [
        parseInt(rgb_beginning[0] * w1 + rgb_end[0] * w2),
        parseInt(rgb_beginning[1] * w1 + rgb_end[1] * w2),
        parseInt(rgb_beginning[2] * w1 + rgb_end[2] * w2),
      ];
      return rgbToHex(rgb[0], rgb[1], rgb[2]);
    };

    let row = [];

    for (let i = 0; i < 24; i++) {
      row.push(
        h(`${i == 11 ? "td.highlight" : "td.lowlight"}`, {
          attributes: {
            style: `background-color:${colourGradientor(
              times_score(person.offset, (i + n + 37) % 24),
              hexToRgb(
                siteSettings
                  .team_timezones_available_colour
              ),
              hexToRgb(
                siteSettings
                  .team_timezones_background_colour
              )
            )};`,
          },
        })
      );
    }

    return row;
  },

  defaultState() {
    //const session = this.container.lookup("session:main");

    const defaultValue = {
      teamTimeZones: null,
      loaded: false,
      loading: false,
    };

    // //let teamTimeZonesStore = session.get("team_time_zones");
    // //let sessionData = null;

    // if (teamTimeZonesStore) {
    //   sessionData = {
    //     teamTimeZones: teamTimeZonesStore,
    //     loaded: false,
    //     loading: false,
    //   };
    // }

    //return sessionData ||

    return defaultValue;
  },

  getUserData(state) {
    if (state.loading) {
      return;
    }

    state.loading = true;

    var self = this;

    return ajax("/teamtimezones").then((result) => {
      if (result) {
        state.teamTimeZones = self.process(result);
        const session = self.container.lookup("session:main");
        session.set("team_time_zones", result);
      } else {
        state.teamTimeZones = [];
      }
      state.loading = false;
      state.loaded = true;
      self.scheduleRerender();
    });
  },

  team(self) {
    return self.siteSettings.team_timezones_group.replace(
      /_/g,
      " "
    );
  },

  header: (self) => {
    let header = [];

    var currentHour = () => {
      const d = new Date();
      return d.getHours();
    };
    const n = currentHour();

    for (let i = -1; i < 24; i++) {
      header.push(
        i < 0
          ? h("th", `Timezones of group: ${self.team(self)}`)
          : i == 11
          ? h("th.highlight", `${(i + n + 37) % 24}`)
          : h("th", `${(i + n + 37) % 24}`)
      );
    }

    return header;
  },

  footer: (self) => {
    let footer = [];

    for (let i = -1; i < 24; i++) {
      footer.push(i == 11 ? h("td.footer.highlight", ``) : h("td", ``));
    }

    return footer;
  },

  html(args, state) {
    if (!state.loaded) {
      this.getUserData(state);
    }

    if (state.loading) {
      return [h("div.spinner-container", h("div.spinner"))];
    }

    var buffer = [];
    var teamTimeZones = state.teamTimeZones;

    if (teamTimeZones !== null) {
      if (teamTimeZones.length > 0) {
        teamTimeZones.forEach((person) => {
          const path = userPath(person.username);
          buffer.push(
            h("tr.team-timezone-row", [
              h(
                "td.team-timezone-user",
                h(
                  "a.team-timezone-user-link",
                  {
                    attributes: {
                      href: path,
                    },
                  },
                  [
                    h("img.team-timezone-avatar", {
                      attributes: {
                        src: person.avatar_template,
                      },
                    }),
                    h("span.team-timezone-username", person.name),
                  ]
                )
              ),
              this.row(person, this),
            ])
          );
        });
      }
    }

    return h(
      "table.time-table",
      {
        attributes: {
          id: "time-table",
        },
      },
      [
        h(
          "thead",
          {
            attributes: {
              id: "header",
            },
          },
          this.header(this)
        ),
        h(
          "tbody",
          {
            attributes: {
              id: "body",
            },
          },
          [
            buffer,
            h(
              "tr",
              {
                attributes: {
                  id: "footer",
                },
              },
              this.footer(this)
            ),
          ]
        ),
      ]
    );
  },
});
