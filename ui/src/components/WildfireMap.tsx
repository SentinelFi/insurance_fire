"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, AlertTriangle, Info } from "lucide-react";
import { Wildfire } from "@/lib/data";
import { getFireData } from "@/actions/map";

const WildfireMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [wildfires, setWildfires] = useState<Wildfire[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    const fetchWildfires = async () => {
      try {
        setLoading(true);
        const csvData = await getFireData();
        const parsedData = parseCSV(csvData);
        setWildfires(parsedData);
        setError(null);
      } catch (err) {
        console.error("Error fetching wildfire data:", err);
        setError("Failed to load wildfire data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchWildfires();
  }, []);

  const parseCSV = (csvData: string): Wildfire[] => {
    const lines = csvData.split("\n");
    const headers = lines[0].split(",");

    const latIndex = headers.indexOf("latitude");
    const lonIndex = headers.indexOf("longitude");
    const brightnessIndex = headers.indexOf("brightness");
    const dateIndex = headers.indexOf("acq_date");
    const timeIndex = headers.indexOf("acq_time");
    const confidenceIndex = headers.indexOf("confidence");

    return lines
      .slice(1)
      .filter((line) => line.trim() !== "")
      .map((line) => {
        const values = line.split(",");
        return {
          latitude: parseFloat(values[latIndex]),
          longitude: parseFloat(values[lonIndex]),
          brightness: parseFloat(values[brightnessIndex]),
          acq_date: values[dateIndex],
          acq_time: values[timeIndex],
          confidence: parseInt(values[confidenceIndex], 10),
        };
      });
  };

  useEffect(() => {
    if (wildfires.length > 0 && !mapInitialized && mapRef.current) {
      initializeMap();
    }
  }, [wildfires, mapInitialized]);

  const initializeMap = () => {
    try {
      // Use a simple map implementation with Leaflet
      const L = (window as any).L;

      if (!L) {
        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.integrity =
          "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
        script.crossOrigin = "";

        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
        link.crossOrigin = "";

        document.head.appendChild(link);
        document.body.appendChild(script);

        script.onload = () => {
          renderMap();
        };
      } else {
        renderMap();
      }
    } catch (err) {
      console.error("Error initializing map:", err);
      setError("Failed to initialize map. Please try again later.");
    }
  };

  const renderMap = () => {
    try {
      const L = (window as any).L;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      // Create map centered on US
      const map = L.map(mapRef.current!).setView([39.8283, -98.5795], 4);
      mapInstanceRef.current = map;

      // Add map tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      // Add wildfire markers
      markersRef.current = wildfires.map((fire) => {
        const intensity = getIntensityColor(fire.brightness);
        const circleMarker = L.circleMarker([fire.latitude, fire.longitude], {
          radius: 8,
          fillColor: intensity,
          color: "#000",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8,
        }).addTo(map);

        // Add popup with info
        circleMarker.bindPopup(`
          <strong>Fire Alert</strong><br>
          Brightness: ${fire.brightness.toFixed(1)}K<br>
          Date: ${fire.acq_date}<br>
          Time: ${formatTime(fire.acq_time)}<br>
          Confidence: ${fire.confidence}%
        `);

        return circleMarker;
      });

      // Add legend
      const legend = L.control({ position: "bottomright" });
      legend.onAdd = () => {
        const div = L.DomUtil.create("div", "info legend");
        div.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
        div.style.padding = "10px";
        div.style.borderRadius = "5px";
        div.style.color = "white";

        div.innerHTML = `
          <h4 style="margin:0 0 5px 0">Fire Intensity</h4>
          <div><span style="background:#ffd2a0;width:15px;height:15px;display:inline-block;border:1px solid #000"></span> Low</div>
          <div><span style="background:#ff9a57;width:15px;height:15px;display:inline-block;border:1px solid #000"></span> Medium</div>
          <div><span style="background:#ff6138;width:15px;height:15px;display:inline-block;border:1px solid #000"></span> High</div>
          <div><span style="background:#ff0000;width:15px;height:15px;display:inline-block;border:1px solid #000"></span> Extreme</div>
        `;

        return div;
      };
      legend.addTo(map);

      setMapInitialized(true);
    } catch (err) {
      console.error("Error rendering map:", err);
      setError("Failed to render map. Please try again later.");
    }
  };

  const getIntensityColor = (brightness: number): string => {
    if (brightness >= 350) return "#ff0000"; // Extreme
    if (brightness >= 325) return "#ff6138"; // High
    if (brightness >= 300) return "#ff9a57"; // Medium
    return "#ffd2a0"; // Low
  };

  const formatTime = (time: string): string => {
    const hour = parseInt(time.substring(0, 2) || "00", 10);
    const minute = time.substring(2, 4) || "00";
    const period = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minute} ${period}`;
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="text-orange-500" size={20} />
          Live Wildfire Monitoring
        </CardTitle>
        <CardDescription>
          Real-time fire data provided by NASA FIRMS
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-[300px] w-full rounded-md" />
            <div className="flex justify-center space-x-4">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center text-center p-8 space-y-4">
            <AlertTriangle size={48} className="text-destructive" />
            <p className="text-destructive">{error}</p>
          </div>
        ) : (
          <>
            <div
              ref={mapRef}
              className="h-[350px] rounded-md overflow-hidden border mb-4"
            ></div>
            <div className="flex flex-wrap gap-2 justify-between items-center">
              <div className="flex items-center text-xs text-muted-foreground">
                <Info size={12} className="mr-1" />
                <span>Last updated: {new Date().toLocaleString()}</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default WildfireMap;
