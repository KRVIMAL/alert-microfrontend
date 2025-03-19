export interface StatusBitDefinition {
    latitudeUnit: string;
    motionState: boolean;
    shackleOpen: boolean;
    activeSim: string;
    connectionType: string;
    gps: boolean;
    gpsOn: boolean;
    ignitionOn: boolean;
    longitudeUnit: string;
    network: string;
    sealOpen: boolean;
    chargeStatus: string;
    connection: boolean;
  }
  
  export interface BaseStation {
    LAC: string;
    MNC: string;
    RXL: string;
    CELLID: string;
  }
  
  export interface AdditionalData {
    MCC?: string;
    baseStation?: BaseStation[];
    dynamicPassword?: string;
    batteryPercentage?: number;
    batteryVoltage?: number;
    networkCsqSignalValue?: number;
    satellites?: number;
    Data?: string;
    "Unknown Message ID"?: string;
  }
  
  export interface AlarmFlagBit {
    overSpeed: boolean;
    shackleWireCut: boolean;
    shellTampered: boolean;
    gnssFailure: boolean;
    gpsAntennaOpen: boolean;
    mcuCommAbnormal: boolean;
    motorStuckUnseal: boolean;
    timeoutParking: boolean;
    gpsAntennaShort: boolean;
    lowBattery: boolean;
    mainPowerFailure: boolean;
    shackleDamaged: boolean;
  }
  
  export interface Alert {
    _id: {
      $oid: string;
    };
    imei: string;
    latitude: number;
    source: string;
    value: string;
    alertType: string;
    deviceType: string;
    dateTime: string;
    deviceTypeAlert: string;
    messageProperty: string;
    packetType: string;
    serialNo: string;
    speed: number;
    alertMessage: string;
    altitude: number;
    bearing: number;
    headerIdentifier: string;
    longitude: number;
    statusBitDefinition: StatusBitDefinition;
    "Additional Data": AdditionalData[];
    alarmFlagBit: AlarmFlagBit;
  }