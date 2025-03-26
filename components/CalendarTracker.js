import React from "react";
import { Box, TextField } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { StaticDatePicker } from "@mui/x-date-pickers/StaticDatePicker";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

export default function CalendarTracker() {
  const today = new Date();

  return (
    <Box>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
        <StaticDatePicker
          value={today}
          onChange={() => {}}
          displayStaticWrapperAs="desktop"
          showDaysOutsideCurrentMonth={false}
          readOnly
          dayOfWeekFormatter={(day) => format(day, "eee", { locale: ko })}
          renderInput={(params) => <TextField {...params} />}
          slotProps={{
            day: ({ day, selected, ...props }) => {
              const isToday =
                format(day, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");

              return (
                <Box
                  {...props}
                  sx={{
                    width: 36,
                    height: 36,
                    lineHeight: "36px",
                    textAlign: "center",
                    borderRadius: "50%",
                    backgroundColor: isToday ? "#1976d2" : "transparent",
                    color: isToday ? "white" : "black",
                    fontWeight: isToday ? "bold" : "normal",
                    cursor: "default",
                  }}
                >
                  {day.getDate()}
                </Box>
              );
            },
          }}
        />
      </LocalizationProvider>
    </Box>
  );
}