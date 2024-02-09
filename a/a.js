async function timetable() {
  let a = await fetch(
    "https://hamptonshs-wa.compass.education/Services/Calendar.svc/GetCalendarEventsByUser?sessionstate=readonly&includeEvents=true&includeExams=true&includeVolunteeringEvent=true&ExcludeNonRelevantPd=false&_dc=1707010386833",
    {
      headers: {
        accept: "*/*",
        "accept-language": "en-GB,en;q=0.9,en-US;q=0.8",
        "content-type": "application/json",
        "sec-ch-ua":
          '"Chromium";v="122", "Not(A:Brand";v="24", "Microsoft Edge";v="122"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest",
        cookie:
          "_fbp=fb.1.1706923658288.1195682257; _gid=GA1.2.1327838114.1706923659; _gcl_au=1.1.778792740.1706923659; cpsdid=ec38248a-e156-4756-8e83-d4d0ecd2e34f; _ga_THF1J8J0MV=GS1.1.1706923412.1.1.1706923724.60.0.0; username=tarek.lehman; _ga_JTLEFB1H3Y=GS1.1.1706923411.2.1.1706923790.0.0.0; _ga_6605QQCE8X=GS1.1.1706923412.2.1.1706923790.0.0.0; cpssid_hampton.wa.edu.au=61c7c665-a0d5-4f0a-802e-e26d7a700627; ASP.NET_SessionId=61c7c665-a0d5-4f0a-802e-e26d7a700627; __cf_bm=0OyQ4HwsoVSZEW5rShBKKdPKlotl3EP2oqOLK7CWMSg-1707010344-1-AY3wNZ4E21Aje7zAMDuDUIxdm9BddWe+ahBw7H8gLaO+IcG1yljahCz2/vsxm66NtuzXNn0eSwoV+DIW3YIakQo=; _gat=1; cf_clearance=cW7BXMH27JBVHm.30LcGoHgHPxZrEtaVTs2lwQYAu0M-1707010351-1-AWTARuWuxltRCQIlniPQJgQT1NzHYiRjw6deflhjohaHUBmDhTkCrk0nP6kbM2Zl5YCyqwspux95GrjD/pVYEfQ=; _ga_8213LMFW6P=GS1.1.1707010348.5.1.1707010383.0.0.0; _ga=GA1.2.1433576124.1706923659; _ga_GWWFF0WZBJ=GS1.1.1707010348.5.1.1707010384.0.0.0",
        Referer: "https://hamptonshs-wa.compass.education/Organise/Calendar/",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
      body: '{"userId":2296,"homePage":false,"activityId":null,"locationId":null,"staffIds":null,"startDate":"2024-01-29","endDate":"2024-02-04","page":1,"start":0,"limit":25}',
      method: "POST",
    }
  );
  a = await a.json().then((result) => {
    return result.d;
  });
  return a;
}
console.log(timetable());