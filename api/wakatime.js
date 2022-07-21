require("dotenv").config();
const {
  renderError,
  parseBoolean,
  clampValue,
  parseArray,
  CONSTANTS,
} = require("../src/common/utils");
const { isLocaleAvailable } = require("../src/translations");
const { fetchWakatimeStats } = require("../src/fetchers/wakatime-fetcher");
const wakatimeCard = require("../src/cards/wakatime-card");
const hardcodedStats = require("./wakatime-fallback");

module.exports = async (req, res) => {
  const {
    username,
    title_color,
    icon_color,
    hide_border,
    line_height,
    text_color,
    bg_color,
    theme,
    cache_seconds,
    hide_title,
    hide_progress,
    custom_title,
    locale,
    layout,
    langs_count,
    hide,
    api_domain,
    range,
    border_radius,
    border_color,
  } = req.query;

  res.setHeader("Content-Type", "image/svg+xml");

  if (locale && !isLocaleAvailable(locale)) {
    return res.send(renderError("Something went wrong", "Language not found"));
  }

  try {
    const stats = await fetchWakatimeStats({ username, api_domain, range });

    let cacheSeconds = clampValue(
      parseInt(cache_seconds || CONSTANTS.FOUR_HOURS, 10),
      CONSTANTS.FOUR_HOURS,
      CONSTANTS.ONE_DAY,
    );

    if (!cache_seconds) {
      cacheSeconds = CONSTANTS.FOUR_HOURS;
    }

    res.setHeader("Cache-Control", `public, max-age=${cacheSeconds}`);

    console.log(stats);
    return res.send(
      wakatimeCard(stats, {
        custom_title,
        hide_title: parseBoolean(hide_title),
        hide_border: parseBoolean(hide_border),
        hide: parseArray(hide),
        line_height,
        title_color,
        icon_color,
        text_color,
        bg_color,
        theme,
        hide_progress,
        border_radius,
        border_color,
        locale: locale ? locale.toLowerCase() : null,
        layout,
        langs_count,
      }),
    );
  } catch (err) {
    // Original code:
    // return res.send(renderError(err.message, err.secondaryMessage));

    // Hardcoded Wakatime Card:
    return res.send(
      wakatimeCard(hardcodedStats, {
        custom_title: "My Wakatime Stats",
        hide_title: false,
        hide_border: false,
        hide: undefined,
        line_height: undefined,
        title_color: undefined,
        icon_color: undefined,
        text_color: undefined,
        bg_color: undefined,
        theme: "panda",
        hide_progress: false,
        border_radius: "0.5%",
        border_color: "#e4e2e2",
        locale: undefined,
        layout: "normal",
        langs_count: 5,
      }),
    );
  }
};
