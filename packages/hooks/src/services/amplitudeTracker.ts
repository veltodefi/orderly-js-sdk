import {
  Identify,
  init as amplitudeInit,
  setUserId as amplitudeSetUserId,
  track as amplitudeTrack,
  identify as amplitudeIdentify,
} from "@amplitude/analytics-browser";
import type { Types } from "@amplitude/analytics-browser";
import { SimpleDI } from "@veltodefi/core";
import { EventEmitter } from "@veltodefi/core";
import { TrackerEventName } from "@veltodefi/types";

export enum ENVType {
  prod = "prod",
  staging = "staging",
  qa = "qa",
  dev = "dev",
}
const apiKeyMap = {
  dev: "4d6b7db0fdd6e9de2b6a270414fd51e0",
  qa: "96476b00bc2701360f9b480629ae5263",
  staging: "dffc00e003479b86d410c448e00f2304",
  prod: "3ab9ae56ed16cc57bc2ac97ffc1098c2",
};

function getAmplitudeConfig(
  env: ENVType,
  amplitudeConfig?: {
    amplitudeId?: string;
    serverZone?: Types.ServerZoneType;
  },
): { amplitudeId: string; options: Types.BrowserOptions } {
  if (!amplitudeConfig) {
    return {
      amplitudeId: apiKeyMap[env],
      options: {
        serverZone: "EU",
      },
    };
  }
  const { amplitudeId, serverZone } = amplitudeConfig;
  return {
    amplitudeId: amplitudeId!,
    options: serverZone
      ? {
          serverZone: serverZone as Types.ServerZoneType,
        }
      : {},
  };
}

export class AmplitudeTracker {
  static instanceName = "amplitudeTracker";
  private _userId: string | undefined;
  private _sdkInfoTag: string | undefined;
  private _ee = SimpleDI.get<EventEmitter>("EE");

  constructor(
    env: ENVType,
    amplitudeConfig:
      | { amplitudeId: string; serverZone?: Types.ServerZoneType }
      | undefined,
    sdkInfo: any,
  ) {
    const { amplitudeId, options } = getAmplitudeConfig(env, amplitudeConfig);
    amplitudeInit(amplitudeId!, options);
    this.setSdkInfo(sdkInfo);
    this._bindEvents();
  }

  setUserId(userId: string) {
    if (userId === this._userId) {
      return;
    }
    amplitudeSetUserId(userId);
    this._userId = userId;
  }

  setSdkInfo(sdkInfo: any) {
    if (this._sdkInfoTag && sdkInfo.address === this._sdkInfoTag) return;
    this.identify(sdkInfo);
    this._sdkInfoTag = sdkInfo.address;
  }

  identify(properties: any) {
    const identify = new Identify();
    Object.entries(properties).forEach(([key, value]) => {
      identify.set(key, value as string);
    });
    amplitudeIdentify(identify);
  }

  track(eventName: TrackerEventName, properties?: any) {
    amplitudeTrack(eventName, properties);
  }

  private _bindEvents() {
    const listenKeys = Object.values(TrackerEventName);
    listenKeys.forEach((key) => {
      this._ee.addListener(key, (params = {}) => {
        if (key === TrackerEventName.trackIdentifyUserId) {
          this.setUserId(params);
        } else if (key === TrackerEventName.trackIdentify) {
          this.identify(params);
        } else if (key === TrackerEventName.trackCustomEvent) {
          const { eventName, ...rest } = params;
          if (!eventName) {
            return;
          }

          this.track(eventName, rest);
        } else {
          this.track(key, params);
        }
      });
    });
  }
}
