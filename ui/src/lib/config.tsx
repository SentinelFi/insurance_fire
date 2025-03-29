export type FireBastionConfig = {
  marketContactAddress: string; // Market creator smart contract
  hedgeContactAddress: string; // Hedge vault smart contract
  riskContactAddress: string; // Risk vault smart contract
  areaName: string; // Covered area center
  epochStartTime: number; // UNIX timestamp
  epochEndTime: number; // UNIX timestamp
  insuranceROI: number; // Calculated using Monte Carlo method
  coverageAPY: number; // Calculated using Monte Carlo method
};

export const configs: FireBastionConfig[] = [
  {
    marketContactAddress:
      "CCRQTEB2IZU6TFC2GAOVUOIQDPCCMZFQGNUNSFTY3QXF2EMEGGO3FNMG",
    hedgeContactAddress:
      "CDNHLHZMU5FL2BPR2RFAZGE3N7I43LIAGOPOPEYE374HKSQ5CVQ5O7SQ",
    riskContactAddress:
      "CDTZJKJIOZWJWOWCZK2XW433ZT5ULLCPU3NBB6RR73TPAOJVJOLFEEZY",
    areaName: "San Francisco Bay Area",
    epochStartTime: 1743292800,
    epochEndTime: 1745971200,
    insuranceROI: 7.25,
    coverageAPY: 8.75,
  },
  {
    marketContactAddress:
      "CD4GXPPUXCJ36QOEEBRQ5X2YGEXNOQOODRV7GIEUED6WPEAKE4HWA75U",
    hedgeContactAddress:
      "CC7NZUTK4NYVAX3QPZ72ED6F62N3XNQVMHCUFBQ23AHEC2HGZPSG2BZT",
    riskContactAddress:
      "CAQA3Y2QP6CVEBDHFGZKZM473XKCZHNHANHSYDD5P7X35BVT65GHQLL5",
    areaName: "San Francisco Bay Area",
    epochStartTime: 1746057600,
    epochEndTime: 1748563200,
    insuranceROI: 8.15,
    coverageAPY: 9.25,
  },
];
