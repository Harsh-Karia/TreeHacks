# Project AVIA - TreeHacks 2025

# Inspiration
Fighter pilots are among the Air Force’s most critical assets—each one represents a $10.9M investment, and every mission puts both lives and high-value aircraft at risk. Yet, 98% of fighter pilots report debilitating fatigue and pain, impacting their performance and operational effectiveness.

This isn’t just a pilot problem—it’s a leadership challenge. Without real-time visibility into pilot health and performance, decisions are being made with limited data. Biometric monitoring changes that. By leveraging wearable technology to track key health and performance metrics, leadership can deploy the right pilot for the right mission, refine training cycles, and enhance overall force readiness. With the power of real-time data, we can make smarter, faster, and more strategic decisions to optimize pilot performance, health, and mission success.

# What It Does
Project AVIA is an AI-driven command center that consolidates real-time biometric data—heart rate, heart rate variability, oxygen saturation (SpO2), sleep quality, stress levels, exercise, and estimated blood pressure—sourced from **Terra API** and **PPG recordings**. Our command center has comprehensive insights into a pilot’s health and performance, enabling leadership to make informed, data-driven decisions.  

We offer insights during:
- Pre-flight : **Readiness Score** that captures stress and fatigue levels
- In-flight : **Performance Score:** Anomaly detection for real-time intervention
- Post-flight : **Success Score** Analysis to optimize long-term health and performance
Project AVIA transforms complex biometric data into clear insights that help leaders make smarter decisions about pilot readiness and deployment. By monitoring vital health indicators in real-time, we can better protect both our pilots and our missions. Commanders get an intuitive dashboard that shows them exactly what they need to know: which pilots are ready for immediate deployment, when specific squadrons are approaching dangerous levels of fatigue, and smart suggestions for mission reassignment and training adjustments, powered by AI.
The system catches early warning signs—like concerning heart rate patterns or blood pressure changes—before they lead to costly accidents or long-term health issues. This proactive approach helps prevent million-dollar mishaps, keeps our squadrons at peak readiness, and ensures our pilots can serve safely for years to come.

# How We Built It
- The Terra API is our pipeline for collecting real-time Garmin metrics, including heart rate, sleep quality, and blood oxygen levels. This integration gives us reliable, continuous access to crucial health indicators for each pilot.
- Our blood pressure analysis algorithm leverages an existing PPG dataset (provided by Terra). This allows us to estimate systolic and diastolic values without ECG equipment—a crucial capability during high-G maneuvers.
- The Mistral AI API handles our advanced data analysis, processing the biometric data and performance data to generate meaningful squadron-level insights. We utilized it to fine-tune the Pixtral Large model in order to detect and evaluate correlations between different health metrics. Using those correlations we then utilized the API once again to develop scores for each pilot and synthesize clear, strategic analytic plans that commanders can quickly utilize to improve squadron performance.
- We initially prototyped our command center dashboard using v0, which helped us rapidly iterate on the design and user interface. After validating our approach, we built the frontend with Express.js and the backend on python. The final dashboard delivers real-time monitoring of pilot readiness and automatic alerts for any concerning changes in pilot health metrics, ensuring that safety-critical information reaches leadership immediately.

# Challenges We Ran Into
- Terra API's data size restrictions sometimes led to incomplete or delayed responses when requesting large amounts of historical data.
- One of our most significant challenges was synthesizing diverse biometric data into a standardized readiness score. We needed to combine various health indicators into a unified metric that would give commanders a clear, immediate understanding of pilot readiness. We relied on our own research and the healthcare mentors (shoutout to them) for guidance. 
- We needed accurate blood pressure estimates using only raw PPG data, so we wrote our own algorithm for processing 
- We encountered network challenges with ngrok and CORS authorization, requiring a deep dive into their documentation and guidance from a mentor to resolve the issue

# Accomplishments That We’re Proud Of
- We successfully delivered on Terra's "Health Command Center" vision by creating a comprehensive squadron monitoring system that live streams Garmin data to the Terra API and then to our frontend. This was a challenging process, as we had numerous ngrok and CORS errors along the way. Now, our platform transforms real-time wearable data into actionable insights that help commanders optimize their pilots' readiness and performance.
- By integrating Mistral AI, we've gone beyond simple data collection. The system intelligently analyzes each pilot's metrics within the context of their squadron, providing commanders with meaningful insights rather than just raw data.
- Our user interface strikes the perfect balance between power and simplicity. We focused heavily on creating an intuitive design that presents complex health data in a clear, easily digestible format that supports quick decision-making.
- Looking ahead, we've built AVIA with scalability in mind. The core technology can be adapted for various high-performance environments—from civil aviation and special operations to professional sports teams—where real-time biometric monitoring could enhance safety and performance.

# What We Learned
Throughout working on this project, we learned a lot regarding how biometric data can actually directly influence military operational readiness. Namely, it was fascinating reading about how there are clear correlations between physiological signals and combat performance. We also learned about the nuances and complexities that went into integrating PPG waveforms into predictive health analytics, and understanding how each metric is correlated with each other. A unique thing we learned was how important it is to optimize API efficiency by separating biometric requests into modular API calls as that greatly improved our performance. We also explored the different metrics that could be estimated from PPG alone, especially blood pressure by utilizing careful signal processing and peak detection.

# What’s Next for Project AVIA
We're incredibly excited about AVIA's future potential to revolutionize how the Air Force approaches pilot health and mission readiness. Here's where we're heading:

- **Long-term Health Insights**: We're planning to build a comprehensive longitudinal database that tracks pilots' health throughout their entire Air Force careers. Imagine being able to understand exactly how G-force exposure affects cardiovascular health over decades, or identifying the optimal rest periods between high-intensity missions. This kind of data has never been available before, and it could completely transform our understanding of pilot longevity and career sustainability.
- **Smarter Training Programs**: Using our performance metrics, we can actually redesign training programs to be more effective and less physically taxing. Think about it: if we notice that certain training patterns consistently lead to faster recovery times or better stress management, we can adapt our obstacle courses and flight simulators accordingly. We're talking about personalized training regimens that maximize readiness while minimizing injury risk – kind of like having a smart AI fitness coach for every pilot.
- **Enhanced Mission Simulation**: One of our most ambitious goals is to use this data to create sophisticated threat scenario simulations. By analyzing how different squadrons perform under various stress conditions, we can identify areas where cooperation between units could be strengthened. For example, if we notice that certain combinations of squadrons consistently show better performance metrics during joint exercises, we can use that information to optimize real-world mission planning.
- **Predictive Health Analytics**: We're working on advanced AI models that can predict potential health issues before they become serious problems. Imagine being able to tell a pilot, "Based on your recent metrics, you're showing early signs of fatigue that typically lead to reduced performance in 48 hours" – that's the kind of proactive intervention that could prevent accidents before they happen.
- **Expanding Beyond Fighter Pilots**: While we started with fighter pilots, we see AVIA's potential extending to other high-stress military roles, commercial aviation, and even space flight operations. The principles of biometric monitoring and performance optimization could be game-changing across the entire aerospace industry.

Ultimately, AVIA isn't just about keeping individual pilots healthy – it's about creating a smarter, more resilient Air Force through the power of data. We're excited to keep pushing the boundaries of what's possible when you combine cutting-edge biometric monitoring with AI-driven insights. The future of military aviation might just be healthier, safer, and more effective than we ever imagined.
