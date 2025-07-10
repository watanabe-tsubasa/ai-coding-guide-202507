import Lake
open Lake DSL

package «formal-verification» where
  version := v!"0.1.0"

lean_lib «FormalVerification» where
  -- add any library configuration options here

@[default_target]
lean_exe «formal-verification» where
  root := `Main