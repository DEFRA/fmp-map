const tileNameMap = {
  'flood-zones-cc': 'Flood_Zones_2_and_3_Rivers_and_Sea_CCP1_NON_PRODUCTION/VectorTileServer',
  'flood-zones': 'Flood_Zones_2_and_3_Rivers_and_Sea_NON_PRODUCTION/VectorTileServer',
  'sw-low': 'Surface_Water_Spatial_Planning_1_in_1000_Depths_NON_PRODUCTION/VectorTileServer',
  'sw-medium': 'Surface_Water_Spatial_Planning_1_in_100_Depths_NON_PRODUCTION/VectorTileServer',
  'sw-high': 'Surface_Water_Spatial_Planning_1_in_30_Depths_NON_PRODUCTION/VectorTileServer',
  'sw-cc-low': 'Surface_Water_Spatial_Planning_1_in_1000_CCP1_Depths_NON_PRODUCTION/VectorTileServer',
  'sw-cc-medium': 'Surface_Water_Spatial_Planning_1_in_100_CCP1_Depths_NON_PRODUCTION/VectorTileServer',
  'sw-cc-high': 'Surface_Water_Spatial_Planning_1_in_30_CCP1_Depths_NON_PRODUCTION/VectorTileServer',
  'main-rivers': 'Statutory_Main_River_Map/FeatureServer',
  'flood-storage': 'Flood_Storage_Areas_NON_PRODUCTION/FeatureServer',
  'flood-defences': 'Defences_NON_PRODUCTION/FeatureServer',
}

export const getEsriTileName = (key) => tileNameMap[key]
