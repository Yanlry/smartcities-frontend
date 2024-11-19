import { useState, useEffect } from "react";
import { fetchReportDetails, fetchRoute, fetchDrivingDistance } from "../services/api";

export const useFetchReportDetails = (
  reportId: number,
  latitude: number | undefined,
  longitude: number | undefined
) => {
  const [report, setReport] = useState<any>(null);
  const [routeCoords, setRouteCoords] = useState<
    Array<{ latitude: number; longitude: number }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!latitude || !longitude) return;

      try {
        const reportData = await fetchReportDetails(reportId, latitude, longitude);
        const gpsDistance = await fetchDrivingDistance(
          latitude,
          longitude,
          reportData.latitude,
          reportData.longitude
        );
        const route = await fetchRoute(
          latitude,
          longitude,
          reportData.latitude,
          reportData.longitude
        );

        setReport({ ...reportData, gpsDistance });
        setRouteCoords(route);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [latitude, longitude, reportId]);

  return { report, routeCoords, loading };
};
