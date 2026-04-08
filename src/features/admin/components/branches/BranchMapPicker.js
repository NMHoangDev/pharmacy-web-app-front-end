import React, { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";

import marker2x from "leaflet/dist/images/marker-icon-2x.png";
import marker1x from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import { Input } from "../../../../shared/components/ui/input";
import { Button } from "../../../../shared/components/ui/button";

// Fix default marker icons for bundlers (CRA/webpack)
// eslint-disable-next-line no-underscore-dangle
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: marker2x,
  iconUrl: marker1x,
  shadowUrl: markerShadow,
});

const VN_BOUNDS = {
  // Rough VN bounds (southwest, northeast)
  sw: [7.5, 102.0],
  ne: [23.6, 110.6],
};

const VN_CENTER = [16.047079, 108.20623]; // Da Nang-ish

const NOMINATIM_EMAIL = process.env.REACT_APP_NOMINATIM_EMAIL;

const normText = (value) => String(value || "").trim();
const lowerText = (value) => normText(value).toLowerCase();

const startsWithAny = (value, prefixes) => {
  const text = lowerText(value);
  if (!text) return false;
  return prefixes.some((p) => text.startsWith(p));
};

const isWardLike = (value) =>
  startsWithAny(value, ["phường", "xã", "thị trấn", "ward", "commune"]);

const isDistrictLike = (value) =>
  startsWithAny(value, [
    "quận",
    "huyện",
    "thị xã",
    // Some places are returned like "Thành phố Thủ Đức" (district-level inside HCMC)
    "thành phố",
    "district",
    "county",
  ]);

const pickFirst = (values, predicate) => {
  for (const v of values) {
    if (!normText(v)) continue;
    if (!predicate || predicate(v)) return normText(v);
  }
  return "";
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isTransientHttpStatus = (status) =>
  status === 429 || status === 502 || status === 503 || status === 504;

const fetchJson = async (url, { timeoutMs = 10000 } = {}) => {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "Accept-Language": "vi",
      },
    });
    return { res, json: res.ok ? await res.json() : null };
  } finally {
    clearTimeout(t);
  }
};

const buildNominatimReverseUrl = (lat, lng) => {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lng));
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("accept-language", "vi");
  if (NOMINATIM_EMAIL) url.searchParams.set("email", NOMINATIM_EMAIL);
  return url.toString();
};

const buildNominatimSearchUrl = (q) => {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("q", q);
  url.searchParams.set("limit", "6");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("accept-language", "vi");
  url.searchParams.set("countrycodes", "vn");
  if (NOMINATIM_EMAIL) url.searchParams.set("email", NOMINATIM_EMAIL);
  return url.toString();
};

const buildPhotonSearchUrl = (q) => {
  // Photon supports bbox: minLon,minLat,maxLon,maxLat
  const url = new URL("https://photon.komoot.io/api/");
  url.searchParams.set("q", q);
  url.searchParams.set("lang", "vi");
  url.searchParams.set("limit", "6");
  url.searchParams.set(
    "bbox",
    `${VN_BOUNDS.sw[1]},${VN_BOUNDS.sw[0]},${VN_BOUNDS.ne[1]},${VN_BOUNDS.ne[0]}`,
  );
  return url.toString();
};

const buildPhotonReverseUrl = (lat, lng) => {
  const url = new URL("https://photon.komoot.io/reverse");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lng));
  url.searchParams.set("lang", "vi");
  return url.toString();
};

const buildBigDataCloudReverseUrl = (lat, lng) => {
  const url = new URL(
    "https://api.bigdatacloud.net/data/reverse-geocode-client",
  );
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lng));
  url.searchParams.set("localityLanguage", "vi");
  return url.toString();
};

const normalizePhotonSearchItem = (feature) => {
  const props = feature?.properties || {};
  const coords = feature?.geometry?.coordinates;
  const lng = Array.isArray(coords) ? Number(coords[0]) : null;
  const lat = Array.isArray(coords) ? Number(coords[1]) : null;
  const display =
    [
      props.name,
      [props.housenumber, props.street].filter(Boolean).join(" "),
      props.district,
      props.city,
      props.state,
      props.country,
    ]
      .filter(Boolean)
      .join(", ") || "";

  const address = {
    house_number: props.housenumber,
    road: props.street,
    suburb: props.district || props.suburb,
    city_district: props.district,
    city: props.city,
    state: props.state,
    country_code: props.countrycode || "vn",
    amenity: props.name,
  };

  return {
    placeId: `${feature?.properties?.osm_id || "photon"}-${lat}-${lng}`,
    lat: Number.isFinite(lat) ? lat : null,
    lng: Number.isFinite(lng) ? lng : null,
    displayName: display,
    name: props.name || "",
    address,
  };
};

const buildAddressParts = (address = {}) => {
  // NOTE: Nominatim/OSM address keys are not perfectly consistent across VN.
  // These heuristics aim to avoid mixing ward-level values into district/city.

  // Ward-level (phường/xã)
  const wardCandidates = [
    address.suburb,
    address.quarter,
    address.neighbourhood,
    address.village,
    address.hamlet,
  ];
  const ward =
    pickFirst(wardCandidates, isWardLike) || pickFirst(wardCandidates);

  // District-level (quận/huyện)
  const districtCandidates = [
    address.city_district,
    address.county,
    address.district,
    address.state_district,
    address.municipality,
  ];
  const district =
    pickFirst(districtCandidates, (v) => !isWardLike(v) && isDistrictLike(v)) ||
    pickFirst(districtCandidates, (v) => !isWardLike(v));

  // City-level (thành phố)
  const cityCandidates = [address.city, address.town, address.municipality];
  let city = pickFirst(cityCandidates, (v) => !isWardLike(v));

  // Province-level (tỉnh / thành phố trực thuộc TW)
  const provinceCandidates = [address.state, address.region];
  const province = pickFirst(provinceCandidates, (v) => !isWardLike(v));

  // Some VN results omit `city` but do have `state` (e.g., Đà Nẵng, TP.HCM)
  if (!city && province) city = province;

  // Country
  const country = address.country_code
    ? String(address.country_code).toUpperCase()
    : "VN";

  // Street address
  const houseNumber = address.house_number || "";
  const road = address.road || address.street || "";
  const amenity = address.amenity || address.building || address.shop || "";

  const addressLine = [amenity, [houseNumber, road].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");

  return { addressLine, ward, district, city, province, country };
};

const normalizeSearchItem = (item) => {
  const lat = Number(item?.lat);
  const lon = Number(item?.lon);
  return {
    placeId: item?.place_id,
    lat: Number.isFinite(lat) ? lat : null,
    lng: Number.isFinite(lon) ? lon : null,
    displayName: item?.display_name || "",
    name:
      item?.name ||
      item?.address?.amenity ||
      item?.address?.building ||
      item?.address?.shop ||
      "",
    address: item?.address || {},
  };
};

const scoreSearchItem = (item) => {
  if (!item) return 0;
  const address = item.address || {};
  const hasHouseNumber = !!normText(address.house_number);
  const hasStreet = !!normText(address.road || address.street);
  const hasCityOrState = !!normText(
    address.city || address.town || address.municipality || address.state,
  );
  const displayName = normText(item.displayName);
  let score = 0;
  if (hasHouseNumber && hasStreet) score += 100;
  if (hasCityOrState) score += 40;
  if (normText(item.name)) score += 10;
  if (displayName) score += Math.min(10, Math.floor(displayName.length / 20));
  return score;
};

const rankResults = (list = []) => {
  const withIndex = list
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => item?.lat != null && item?.lng != null);

  withIndex.sort((a, b) => {
    const scoreDiff = scoreSearchItem(b.item) - scoreSearchItem(a.item);
    if (scoreDiff !== 0) return scoreDiff;
    return a.index - b.index;
  });

  return withIndex.map(({ item }) => item);
};

const applyPickToFormValues = (currentValues, pick, options = {}) => {
  const {
    fillName = false,
    preferAutoFillName = false,
    overwriteAddressFields = true,
  } = options;

  const { lat, lng, address = {}, displayName = "", name = "" } = pick;
  const parts = buildAddressParts(address);

  const displayFirst = displayName ? String(displayName).split(",")[0] : "";
  const addressLine = parts.addressLine || displayFirst;

  const next = {
    ...currentValues,
    latitude: String(lat),
    longitude: String(lng),
  };

  const setField = (fieldName, newValue) => {
    if (!overwriteAddressFields) {
      if (String(next[fieldName] || "").trim()) return;
    }
    // When overwriting, also clear stale values if we don't have a new one.
    if (overwriteAddressFields) {
      next[fieldName] = normText(newValue);
      return;
    }

    const v = normText(newValue);
    if (v) next[fieldName] = v;
  };

  setField("addressLine", addressLine);
  setField("ward", parts.ward);
  setField("district", parts.district);
  setField("city", parts.city);
  setField("province", parts.province);
  setField("country", parts.country || "VN");

  const shouldFillName = fillName || preferAutoFillName;
  if (shouldFillName) {
    const existingName = String(next.name || "").trim();
    if (!existingName) {
      const suggestion =
        name || address.amenity || address.building || displayFirst;
      if (suggestion) next.name = suggestion;
    }
  }

  return { next, parts };
};

const MapClick = ({ onPick }) => {
  useMapEvents({
    click: (e) => {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
};

const BranchMapPicker = ({ value, onChange, preferAutoFillName = false }) => {
  const [search, setSearch] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [results, setResults] = useState([]);

  const [geoLoading, setGeoLoading] = useState(false);

  const [reverseLoading, setReverseLoading] = useState(false);
  const [reverseError, setReverseError] = useState("");

  const mapRef = useRef(null);

  const marker = useMemo(() => {
    const lat = Number(value?.latitude);
    const lng = Number(value?.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng };
  }, [value?.latitude, value?.longitude]);

  const setLatLng = async ({ lat, lng }, options = {}) => {
    const {
      fillAddress = true,
      fillName = false,
      overwriteAddressFields = true,
    } = options;

    // Always set lat/lng immediately (functional update avoids stale overwrites)
    onChange((prev) => ({
      ...prev,
      latitude: String(lat),
      longitude: String(lng),
    }));

    if (!fillAddress) return;

    setReverseLoading(true);
    setReverseError("");
    try {
      const tryReverse = async (providerName, url, parser) => {
        // Retry transient errors a couple times
        for (let attempt = 0; attempt < 2; attempt += 1) {
          const { res, json } = await fetchJson(url, { timeoutMs: 12000 });
          if (res.ok && json) return { providerName, ...parser(json) };
          if (!isTransientHttpStatus(res.status)) {
            const msg = `Không thể lấy địa chỉ (${providerName})`;
            throw new Error(msg);
          }
          // transient -> backoff
          await sleep(450 * (attempt + 1));
        }
        throw new Error(`Dịch vụ lấy địa chỉ đang bận (${providerName})`);
      };

      const nominatimUrl = buildNominatimReverseUrl(lat, lng);
      const photonUrl = buildPhotonReverseUrl(lat, lng);
      const bdcUrl = buildBigDataCloudReverseUrl(lat, lng);

      let parsed;
      try {
        parsed = await tryReverse("nominatim", nominatimUrl, (data) => ({
          address: data?.address || {},
          displayName: data?.display_name || "",
          name: data?.name || "",
        }));
      } catch (e1) {
        try {
          parsed = await tryReverse("photon", photonUrl, (data) => {
            const f = Array.isArray(data?.features) ? data.features[0] : null;
            const props = f?.properties || {};
            const address = {
              house_number: props.housenumber,
              road: props.street,
              suburb: props.district || props.suburb,
              city_district: props.district,
              city: props.city,
              state: props.state,
              country_code: props.countrycode || "vn",
              amenity: props.name,
            };
            const displayName =
              [
                props.name,
                [props.housenumber, props.street].filter(Boolean).join(" "),
                props.district,
                props.city,
                props.state,
                props.country,
              ]
                .filter(Boolean)
                .join(", ") || "";
            return { address, displayName, name: props.name || "" };
          });
        } catch (e2) {
          parsed = await tryReverse("bigdatacloud", bdcUrl, (data) => {
            const address = {
              // Best-effort mapping
              city: data?.city || data?.locality || "",
              state: data?.principalSubdivision || "",
              country_code: (data?.countryCode || "VN").toLowerCase(),
              suburb: data?.locality || "",
              city_district: data?.locality || "",
            };
            const displayName =
              [
                data?.locality,
                data?.city,
                data?.principalSubdivision,
                data?.countryName,
              ]
                .filter(Boolean)
                .join(", ") || "";
            return { address, displayName, name: data?.locality || "" };
          });
        }
      }

      onChange((prev) => {
        const { next } = applyPickToFormValues(
          prev,
          {
            lat,
            lng,
            address: parsed?.address || {},
            displayName: parsed?.displayName || "",
            name: parsed?.name || "",
          },
          {
            fillName,
            preferAutoFillName,
            overwriteAddressFields,
          },
        );
        return next;
      });

      if (mapRef.current) {
        mapRef.current.setView(
          [lat, lng],
          Math.max(mapRef.current.getZoom(), 16),
        );
      }
    } catch (err) {
      setReverseError(
        err?.message ||
          "Không thể lấy địa chỉ (dịch vụ đang bận). Tọa độ vẫn đã được điền.",
      );
    } finally {
      setReverseLoading(false);
    }
  };

  // Basic debounce search
  useEffect(() => {
    const q = search.trim();
    if (!q) {
      setResults([]);
      setSearchError("");
      return undefined;
    }

    const t = setTimeout(async () => {
      setSearchLoading(true);
      setSearchError("");
      try {
        // Prefer Photon, fallback to Nominatim on failure
        const photonUrl = buildPhotonSearchUrl(q);
        const nominatimUrl = buildNominatimSearchUrl(q);

        try {
          const photon = await fetchJson(photonUrl, { timeoutMs: 12000 });
          if (!photon.res.ok) {
            throw new Error("Photon failed");
          }
          const features = Array.isArray(photon.json?.features)
            ? photon.json.features
            : [];
          const list = features.map(normalizePhotonSearchItem);
          const ranked = rankResults(list).slice(0, 6);
          setResults(ranked);
          return;
        } catch (photonError) {
          const { res, json } = await fetchJson(nominatimUrl, {
            timeoutMs: 12000,
          });
          if (!res.ok || !Array.isArray(json)) {
            throw new Error("Không thể tìm địa điểm");
          }
          const list = json.map(normalizeSearchItem);
          const ranked = rankResults(list).slice(0, 6);
          setResults(ranked);
        }
      } catch (err) {
        setSearchError(err.message || "Không thể tìm địa điểm");
      } finally {
        setSearchLoading(false);
      }
    }, 450);

    return () => clearTimeout(t);
  }, [search]);

  const geoErrorToMessage = (err) => {
    const code = err?.code;
    if (code === 1) return "Bạn đã từ chối quyền truy cập vị trí.";
    if (code === 2) return "Không thể xác định vị trí hiện tại.";
    if (code === 3) return "Quá thời gian lấy vị trí. Thử lại lần nữa.";
    return err?.message || "Không thể lấy vị trí hiện tại";
  };

  const onUseMyLocation = () => {
    setReverseError("");

    // Geolocation usually requires HTTPS (localhost is allowed)
    const isLocalhost =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1");
    if (
      typeof window !== "undefined" &&
      !window.isSecureContext &&
      !isLocalhost
    ) {
      setReverseError(
        "Tính năng định vị cần HTTPS (hoặc chạy trên localhost).",
      );
      return;
    }

    if (!navigator.geolocation) {
      setReverseError("Trình duyệt không hỗ trợ định vị");
      return;
    }

    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoLoading(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        // Center map quickly for feedback
        if (mapRef.current) {
          mapRef.current.setView(
            [lat, lng],
            Math.max(mapRef.current.getZoom(), 16),
          );
        }

        setLatLng(
          { lat, lng },
          { fillAddress: true, fillName: preferAutoFillName },
        );
      },
      (err) => {
        setGeoLoading(false);
        setReverseError(geoErrorToMessage(err));
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 },
    );
  };

  const bounds = useMemo(() => [VN_BOUNDS.sw, VN_BOUNDS.ne], []);

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex-1 min-w-0">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm địa điểm tại Việt Nam (vd: 123 Nguyễn Huệ, Q1)"
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onUseMyLocation}
              title="Dùng vị trí hiện tại"
              disabled={geoLoading}
            >
              {geoLoading ? "Đang định vị..." : "Vị trí của tôi"}
            </Button>
          </div>
        </div>

        {searchLoading ? (
          <p className="mt-2 text-xs text-slate-500">Đang tìm...</p>
        ) : null}
        {searchError ? (
          <p className="mt-2 text-xs text-red-600">{searchError}</p>
        ) : null}

        {results?.length ? (
          <div className="mt-2 grid grid-cols-1 gap-2">
            {results.map((r) => (
              <button
                key={r.placeId}
                type="button"
                onClick={() => {
                  onChange((prev) => {
                    const { next, parts } = applyPickToFormValues(
                      prev,
                      {
                        lat: r.lat,
                        lng: r.lng,
                        address: r.address,
                        displayName: r.displayName,
                        name: r.name,
                      },
                      {
                        fillName: preferAutoFillName,
                        preferAutoFillName,
                        overwriteAddressFields: true,
                      },
                    );

                    // If the search result lacks some parts, enrich via reverse-geocode.
                    // (fire-and-forget; state already updated with best effort)
                    if (
                      !parts.ward ||
                      !parts.district ||
                      !parts.city ||
                      !parts.province
                    ) {
                      setLatLng(
                        { lat: r.lat, lng: r.lng },
                        {
                          fillAddress: true,
                          fillName: preferAutoFillName,
                          overwriteAddressFields: true,
                        },
                      );
                    }

                    return next;
                  });

                  if (mapRef.current) {
                    mapRef.current.setView(
                      [r.lat, r.lng],
                      Math.max(mapRef.current.getZoom(), 16),
                    );
                  }
                }}
                className="text-left p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                  {r.name || r.displayName.split(",")[0]}
                </div>
                <div className="text-xs text-slate-500 line-clamp-2">
                  {r.displayName}
                </div>
              </button>
            ))}
          </div>
        ) : null}

        {reverseLoading ? (
          <p className="mt-2 text-xs text-slate-500">Đang lấy địa chỉ...</p>
        ) : null}
        {reverseError ? (
          <p className="mt-2 text-xs text-red-600">{reverseError}</p>
        ) : null}

        <p className="mt-2 text-xs text-slate-500">
          Click lên bản đồ để chọn vị trí. Hệ thống sẽ tự điền tọa độ và địa chỉ
          (theo OpenStreetMap).
        </p>
      </div>

      <div className="h-[360px] bg-slate-100 dark:bg-slate-950">
        <MapContainer
          center={marker ? [marker.lat, marker.lng] : VN_CENTER}
          zoom={marker ? 16 : 6}
          scrollWheelZoom
          style={{ height: "100%", width: "100%" }}
          maxBounds={bounds}
          maxBoundsViscosity={0.9}
          whenCreated={(map) => {
            mapRef.current = map;
          }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapClick
            onPick={({ lat, lng }) =>
              setLatLng(
                { lat, lng },
                { fillAddress: true, fillName: preferAutoFillName },
              )
            }
          />

          {marker ? <Marker position={[marker.lat, marker.lng]} /> : null}
        </MapContainer>
      </div>
    </div>
  );
};

export default BranchMapPicker;
